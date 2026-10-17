import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIncidentAnalyses1792235771174 implements MigrationInterface {
  name = 'AddIncidentAnalyses1792235771174';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."incident_analyses_status_enum" AS ENUM('pending', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "incident_analyses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "incidentId" uuid NOT NULL, "requestedById" uuid NOT NULL, "status" "public"."incident_analyses_status_enum" NOT NULL DEFAULT 'pending', "model" character varying(100), "result" jsonb, "error" text, "inputTokens" integer, "outputTokens" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "completedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_3d5e20cd7421ab439af0168000b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9f7e3b9cf43805467109290079" ON "incident_analyses"  ("incidentId", "createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "incident_analyses" ADD CONSTRAINT "FK_a92d2db7bba68fa580592eaf98d" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "incident_analyses" ADD CONSTRAINT "FK_7a9f1a8613338ff8c87c5b47548" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "incident_analyses" DROP CONSTRAINT "FK_7a9f1a8613338ff8c87c5b47548"`,
    );
    await queryRunner.query(
      `ALTER TABLE "incident_analyses" DROP CONSTRAINT "FK_a92d2db7bba68fa580592eaf98d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9f7e3b9cf43805467109290079"`,
    );
    await queryRunner.query(`DROP TABLE "incident_analyses"`);
    await queryRunner.query(
      `DROP TYPE "public"."incident_analyses_status_enum"`,
    );
  }
}
