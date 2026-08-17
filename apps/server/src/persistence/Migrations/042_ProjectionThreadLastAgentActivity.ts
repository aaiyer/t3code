import * as Effect from "effect/Effect";
import * as SqlClient from "effect/unstable/sql/SqlClient";

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`
    ALTER TABLE projection_threads
    ADD COLUMN last_agent_activity_at TEXT
  `;
  yield* sql`
    UPDATE projection_threads
    SET last_agent_activity_at = (
      SELECT MAX(agent_activity_at)
      FROM (
        SELECT updated_at AS agent_activity_at
        FROM projection_thread_messages
        WHERE projection_thread_messages.thread_id = projection_threads.thread_id
          AND role = 'assistant'
        UNION ALL
        SELECT created_at AS agent_activity_at
        FROM projection_thread_activities
        WHERE projection_thread_activities.thread_id = projection_threads.thread_id
      )
    )
  `;
});
