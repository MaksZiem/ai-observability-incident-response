import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAlertRules1792254328600 implements MigrationInterface {
  name = 'AddAlertRules1792254328600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."alert_rules_metric_enum" AS ENUM('error_rate', 'p95_latency', 'request_count')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."alert_rules_comparator_enum" AS ENUM('gt', 'lt')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."alert_rules_incidentseverity_enum" AS ENUM('low', 'medium', 'high', 'critical')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."alert_rules_status_enum" AS ENUM('ok', 'firing')`,
    );
    await queryRunner.query(
      `CREATE TABLE "alert_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "projectId" uuid NOT NULL, "name" character varying(100) NOT NULL, "metric" "public"."alert_rules_metric_enum" NOT NULL, "comparator" "public"."alert_rules_comparator_enum" NOT NULL, "threshold" double precision NOT NULL, "windowMinutes" integer NOT NULL, "service" character varying(100), "createIncident" boolean NOT NULL DEFAULT true, "incidentSeverity" "public"."alert_rules_incidentseverity_enum" NOT NULL DEFAULT 'high', "webhookUrl" character varying(2048), "enabled" boolean NOT NULL DEFAULT true, "status" "public"."alert_rules_status_enum" NOT NULL DEFAULT 'ok', "lastValue" double precision, "lastEvaluatedAt" TIMESTAMP WITH TIME ZONE, "lastTriggeredAt" TIMESTAMP WITH TIME ZONE, "createdById" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ae580564f087ffab9d229225aec" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e233211c9c5c71daa17fb266bd" ON "alert_rules"  ("projectId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alert_rules" ADD CONSTRAINT "FK_e233211c9c5c71daa17fb266bdf" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert_rules" ADD CONSTRAINT "FK_d80f126b68ff54636b4cda1e4e5" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alert_rules" DROP CONSTRAINT "FK_d80f126b68ff54636b4cda1e4e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert_rules" DROP CONSTRAINT "FK_e233211c9c5c71daa17fb266bdf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e233211c9c5c71daa17fb266bd"`,
    );
    await queryRunner.query(`DROP TABLE "alert_rules"`);
    await queryRunner.query(`DROP TYPE "public"."alert_rules_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."alert_rules_incidentseverity_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."alert_rules_comparator_enum"`);
    await queryRunner.query(`DROP TYPE "public"."alert_rules_metric_enum"`);
  }
}
