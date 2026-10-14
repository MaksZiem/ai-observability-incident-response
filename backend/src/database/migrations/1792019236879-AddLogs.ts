import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLogs1792019236879 implements MigrationInterface {
  name = 'AddLogs1792019236879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."logs_level_enum" AS ENUM('debug', 'info', 'warn', 'error', 'fatal')`,
    );
    await queryRunner.query(
      `CREATE TABLE "logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "projectId" uuid NOT NULL, "service" character varying(100) NOT NULL, "level" "public"."logs_level_enum" NOT NULL, "message" text NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "traceId" character varying(64), "spanId" character varying(64), "requestId" character varying(128), "endpoint" character varying(255), "attributes" jsonb NOT NULL DEFAULT '{}', "receivedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_fb1b805f2f7795de79fa69340ba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ca58d401749ec69fec1ef613c2" ON "logs"  ("projectId", "traceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_241e8bf17ec5321a76bef55e5a" ON "logs"  ("projectId", "timestamp") `,
    );
    await queryRunner.query(
      `ALTER TABLE "logs" ADD CONSTRAINT "FK_19bc2d0c965baaff49c69cec89c" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "logs" DROP CONSTRAINT "FK_19bc2d0c965baaff49c69cec89c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_241e8bf17ec5321a76bef55e5a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ca58d401749ec69fec1ef613c2"`,
    );
    await queryRunner.query(`DROP TABLE "logs"`);
    await queryRunner.query(`DROP TYPE "public"."logs_level_enum"`);
  }
}
