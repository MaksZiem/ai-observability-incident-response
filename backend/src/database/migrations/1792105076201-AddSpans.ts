import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpans1792105076201 implements MigrationInterface {
  name = 'AddSpans1792105076201';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."spans_status_enum" AS ENUM('ok', 'error')`,
    );
    await queryRunner.query(
      `CREATE TABLE "spans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "projectId" uuid NOT NULL, "traceId" character varying(64) NOT NULL, "spanId" character varying(64) NOT NULL, "parentSpanId" character varying(64), "service" character varying(100) NOT NULL, "name" character varying(255) NOT NULL, "status" "public"."spans_status_enum" NOT NULL DEFAULT 'ok', "startTime" TIMESTAMP WITH TIME ZONE NOT NULL, "durationMs" double precision NOT NULL, "attributes" jsonb NOT NULL DEFAULT '{}', "receivedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d6c9292739a30f7656d16a46881" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1c312716e542dcd9cf9285550a" ON "spans"  ("projectId", "startTime") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9e8e491b1feda0360c4662dac5" ON "spans"  ("projectId", "traceId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "spans" ADD CONSTRAINT "FK_b3b2ddb8791f161a10bd07eec7b" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "spans" DROP CONSTRAINT "FK_b3b2ddb8791f161a10bd07eec7b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9e8e491b1feda0360c4662dac5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1c312716e542dcd9cf9285550a"`,
    );
    await queryRunner.query(`DROP TABLE "spans"`);
    await queryRunner.query(`DROP TYPE "public"."spans_status_enum"`);
  }
}
