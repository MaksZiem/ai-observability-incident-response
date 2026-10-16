import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIncidents1792171480924 implements MigrationInterface {
  name = 'AddIncidents1792171480924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."incidents_severity_enum" AS ENUM('low', 'medium', 'high', 'critical')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."incidents_status_enum" AS ENUM('open', 'investigating', 'resolved')`,
    );
    await queryRunner.query(
      `CREATE TABLE "incidents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "projectId" uuid NOT NULL, "number" integer NOT NULL, "title" character varying(200) NOT NULL, "description" text, "severity" "public"."incidents_severity_enum" NOT NULL, "status" "public"."incidents_status_enum" NOT NULL DEFAULT 'open', "createdById" uuid NOT NULL, "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "resolvedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_ee088483a5d3f0e711f110accfc" UNIQUE ("projectId", "number"), CONSTRAINT "PK_ccb34c01719889017e2246469f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_158cba89c23a0f770cb10a6083" ON "incidents"  ("projectId", "startedAt") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."incident_links_kind_enum" AS ENUM('error_group', 'trace', 'deployment', 'log')`,
    );
    await queryRunner.query(
      `CREATE TABLE "incident_links" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "incidentId" uuid NOT NULL, "kind" "public"."incident_links_kind_enum" NOT NULL, "targetId" character varying(64) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_572397bf1f25da2198f85f8609d" UNIQUE ("incidentId", "kind", "targetId"), CONSTRAINT "PK_6304c8b743a30760d1af842f781" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "incident_notes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "incidentId" uuid NOT NULL, "authorId" uuid NOT NULL, "body" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_213673177d807c19f3081e18b2e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_85c0b016c9e3bf3eae91fa0808" ON "incident_notes"  ("incidentId", "createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "lastIncidentNumber" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "incidents" ADD CONSTRAINT "FK_b59253407df1320b7abadc3d4dd" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "incidents" ADD CONSTRAINT "FK_d5efaf30d8cb508318ce25df35c" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "incident_links" ADD CONSTRAINT "FK_533678803ecf98e6f3d1f8fc5da" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "incident_notes" ADD CONSTRAINT "FK_259cda8167949c4b3830491f2f3" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "incident_notes" ADD CONSTRAINT "FK_4a847dfd35eb44ecb5c7cbf2553" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "incident_notes" DROP CONSTRAINT "FK_4a847dfd35eb44ecb5c7cbf2553"`,
    );
    await queryRunner.query(
      `ALTER TABLE "incident_notes" DROP CONSTRAINT "FK_259cda8167949c4b3830491f2f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "incident_links" DROP CONSTRAINT "FK_533678803ecf98e6f3d1f8fc5da"`,
    );
    await queryRunner.query(
      `ALTER TABLE "incidents" DROP CONSTRAINT "FK_d5efaf30d8cb508318ce25df35c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "incidents" DROP CONSTRAINT "FK_b59253407df1320b7abadc3d4dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN "lastIncidentNumber"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_85c0b016c9e3bf3eae91fa0808"`,
    );
    await queryRunner.query(`DROP TABLE "incident_notes"`);
    await queryRunner.query(`DROP TABLE "incident_links"`);
    await queryRunner.query(`DROP TYPE "public"."incident_links_kind_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_158cba89c23a0f770cb10a6083"`,
    );
    await queryRunner.query(`DROP TABLE "incidents"`);
    await queryRunner.query(`DROP TYPE "public"."incidents_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."incidents_severity_enum"`);
  }
}
