import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIncidentChat1792250770040 implements MigrationInterface {
  name = 'AddIncidentChat1792250770040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."incident_chat_messages_role_enum" AS ENUM('user', 'assistant')`,
    );
    await queryRunner.query(
      `CREATE TABLE "incident_chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "incidentId" uuid NOT NULL, "role" "public"."incident_chat_messages_role_enum" NOT NULL, "content" text NOT NULL, "authorId" uuid, "model" character varying(100), "inputTokens" integer, "outputTokens" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_e275cb028cbeb778c38902af6e7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5d886a49d03d776bfe32f1ac58" ON "incident_chat_messages"  ("incidentId", "createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "incident_chat_messages" ADD CONSTRAINT "FK_d62b41fe16a1613ffb36c87d937" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "incident_chat_messages" ADD CONSTRAINT "FK_80c31485b8b49e2b14c152c78f2" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "incident_chat_messages" DROP CONSTRAINT "FK_80c31485b8b49e2b14c152c78f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "incident_chat_messages" DROP CONSTRAINT "FK_d62b41fe16a1613ffb36c87d937"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5d886a49d03d776bfe32f1ac58"`,
    );
    await queryRunner.query(`DROP TABLE "incident_chat_messages"`);
    await queryRunner.query(
      `DROP TYPE "public"."incident_chat_messages_role_enum"`,
    );
  }
}
