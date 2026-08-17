import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as SqlClient from "effect/unstable/sql/SqlClient";

import { runMigrations } from "../Migrations.ts";
import * as NodeSqliteClient from "../NodeSqliteClient.ts";

const layer = it.layer(Layer.mergeAll(NodeSqliteClient.layerMemory()));

layer("042_ProjectionThreadLastAgentActivity", (it) => {
  it.effect("adds nullable persisted agent activity state", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      yield* runMigrations({ toMigrationInclusive: 41 });
      const before = yield* sql<{ readonly name: string }>`
        PRAGMA table_info(projection_threads)
      `;
      assert.isFalse(before.some((column) => column.name === "last_agent_activity_at"));

      yield* sql`
        INSERT INTO projection_threads (
          thread_id,
          project_id,
          title,
          model_selection_json,
          runtime_mode,
          interaction_mode,
          created_at,
          updated_at
        ) VALUES (
          'thread-1',
          'project-1',
          'Thread 1',
          '{"provider":"codex","model":"gpt-5-codex"}',
          'full-access',
          'default',
          '2026-08-17T02:00:00.000Z',
          '2026-08-17T02:00:00.000Z'
        )
      `;
      yield* sql`
        INSERT INTO projection_thread_messages (
          message_id,
          thread_id,
          role,
          text,
          is_streaming,
          created_at,
          updated_at
        ) VALUES
          (
            'assistant-1',
            'thread-1',
            'assistant',
            'Working on it',
            0,
            '2026-08-17T02:01:00.000Z',
            '2026-08-17T02:02:00.000Z'
          ),
          (
            'user-1',
            'thread-1',
            'user',
            'A newer user message',
            0,
            '2026-08-17T02:04:00.000Z',
            '2026-08-17T02:04:00.000Z'
          )
      `;
      yield* sql`
        INSERT INTO projection_thread_activities (
          activity_id,
          thread_id,
          tone,
          kind,
          summary,
          payload_json,
          created_at
        ) VALUES (
          'activity-1',
          'thread-1',
          'tool',
          'tool.started',
          'Command started',
          '{}',
          '2026-08-17T02:03:00.000Z'
        )
      `;

      yield* runMigrations({ toMigrationInclusive: 42 });
      const after = yield* sql<{ readonly name: string }>`
        PRAGMA table_info(projection_threads)
      `;
      assert.isTrue(after.some((column) => column.name === "last_agent_activity_at"));
      const rows = yield* sql<{ readonly lastAgentActivityAt: string | null }>`
        SELECT last_agent_activity_at AS "lastAgentActivityAt"
        FROM projection_threads
        WHERE thread_id = 'thread-1'
      `;
      assert.deepStrictEqual(rows, [{ lastAgentActivityAt: "2026-08-17T02:03:00.000Z" }]);
    }),
  );
});
