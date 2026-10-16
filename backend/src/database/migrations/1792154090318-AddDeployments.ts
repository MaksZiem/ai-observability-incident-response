import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeployments1792154090318 implements MigrationInterface {
  name = 'AddDeployments1792154090318';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "deployments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "projectId" uuid NOT NULL, "version" character varying(100) NOT NULL, "service" character varying(100), "commitSha" character varying(64), "description" text, "deployedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1e5627acb3c950deb83fe98fc48" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6d88302ebca9ba6f2e952bbf07" ON "deployments"  ("projectId", "deployedAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "deployments" ADD CONSTRAINT "FK_14a57409d21ee0032132f200c2b" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "deployments" DROP CONSTRAINT "FK_14a57409d21ee0032132f200c2b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6d88302ebca9ba6f2e952bbf07"`,
    );
    await queryRunner.query(`DROP TABLE "deployments"`);
  }
}
