import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddErrors1792152377301 implements MigrationInterface {
  name = 'AddErrors1792152377301';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."error_groups_status_enum" AS ENUM('open', 'investigating', 'resolved')`,
    );
    await queryRunner.query(
      `CREATE TABLE "error_groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "projectId" uuid NOT NULL, "fingerprint" character varying(64) NOT NULL, "type" character varying(255) NOT NULL, "message" text NOT NULL, "service" character varying(100) NOT NULL, "endpoint" character varying(255), "status" "public"."error_groups_status_enum" NOT NULL DEFAULT 'open', "occurrences" integer NOT NULL DEFAULT '0', "firstSeen" TIMESTAMP WITH TIME ZONE NOT NULL, "lastSeen" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_af5c84f548cc28dece4bd01badb" UNIQUE ("projectId", "fingerprint"), CONSTRAINT "PK_75f3d2ade79d16975fb3b39352c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7975f8785e99a12d44e191f877" ON "error_groups"  ("projectId", "lastSeen") `,
    );
    await queryRunner.query(
      `CREATE TABLE "error_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "projectId" uuid NOT NULL, "groupId" uuid NOT NULL, "service" character varying(100) NOT NULL, "message" text NOT NULL, "stackTrace" text, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "endpoint" character varying(255), "traceId" character varying(64), "spanId" character varying(64), "requestId" character varying(128), "attributes" jsonb NOT NULL DEFAULT '{}', "receivedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_171d68491fad5e8354152024549" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d51ee45ce1877c4fc1215c0fc7" ON "error_events"  ("projectId", "traceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8198f283e617b571623943f8f" ON "error_events"  ("groupId", "timestamp") `,
    );
    await queryRunner.query(
      `ALTER TABLE "error_groups" ADD CONSTRAINT "FK_2cbf8eba5c70f1845a520300045" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "error_events" ADD CONSTRAINT "FK_b8845799b1f04a65371764b7912" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "error_events" ADD CONSTRAINT "FK_f655a47ee479b7b905b0a447914" FOREIGN KEY ("groupId") REFERENCES "error_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "error_events" DROP CONSTRAINT "FK_f655a47ee479b7b905b0a447914"`,
    );
    await queryRunner.query(
      `ALTER TABLE "error_events" DROP CONSTRAINT "FK_b8845799b1f04a65371764b7912"`,
    );
    await queryRunner.query(
      `ALTER TABLE "error_groups" DROP CONSTRAINT "FK_2cbf8eba5c70f1845a520300045"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b8198f283e617b571623943f8f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d51ee45ce1877c4fc1215c0fc7"`,
    );
    await queryRunner.query(`DROP TABLE "error_events"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7975f8785e99a12d44e191f877"`,
    );
    await queryRunner.query(`DROP TABLE "error_groups"`);
    await queryRunner.query(`DROP TYPE "public"."error_groups_status_enum"`);
  }
}
