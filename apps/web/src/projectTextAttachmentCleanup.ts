import type { EnvironmentId, ScopedProjectRef, ScopedThreadRef } from "@t3tools/contracts";

import { composerDraftTargetsProject, useComposerDraftStore } from "./composerDraftStore";
import {
  fenceTextAttachmentUploadOwner,
  releaseTextAttachmentClaimsInBackground,
  resumeTextAttachmentUploadOwner,
  textAttachmentClaims,
  textAttachmentDraftOwnerId,
  tombstoneTextAttachmentUploadOwner,
} from "./textAttachmentClaims";

export async function prepareProjectTextAttachmentCleanup(input: {
  projectRef: ScopedProjectRef;
  threadRefs: ReadonlyArray<ScopedThreadRef>;
  release: (input: {
    environmentId: EnvironmentId;
    path: string;
    draftOwnerId: string;
  }) => Promise<boolean>;
}): Promise<{
  rollback: () => void;
  commit: () => Promise<{ readonly durable: boolean }>;
}> {
  const store = useComposerDraftStore.getState();
  const targets = composerDraftTargetsProject(input.projectRef, input.threadRefs);
  const claims = targets.flatMap((target) =>
    textAttachmentClaims(target, store.getComposerDraft(target)?.prompt ?? ""),
  );
  const ownerIds = targets.map(textAttachmentDraftOwnerId);
  await Promise.all(
    ownerIds.map((ownerId) =>
      fenceTextAttachmentUploadOwner(input.projectRef.environmentId, ownerId),
    ),
  );

  return {
    rollback: () => {
      for (const ownerId of ownerIds) {
        resumeTextAttachmentUploadOwner(input.projectRef.environmentId, ownerId);
      }
    },
    commit: async () => {
      const releaseResult = await releaseTextAttachmentClaimsInBackground({
        environmentId: input.projectRef.environmentId,
        claims,
        draftOwnerIds: ownerIds,
        release: ({ path, draftOwnerId }) =>
          input.release({
            environmentId: input.projectRef.environmentId,
            path,
            draftOwnerId,
          }),
      });
      for (const target of targets) {
        store.clearDraftThread(target);
        tombstoneTextAttachmentUploadOwner(
          input.projectRef.environmentId,
          textAttachmentDraftOwnerId(target),
        );
      }
      store.clearProjectDraftThreadId(input.projectRef);
      return { durable: releaseResult.durable && releaseResult.rejected.length === 0 };
    },
  };
}
