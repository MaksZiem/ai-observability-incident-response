import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjects1791981707275 implements MigrationInterface {
  name = 'AddProjects1791981707275';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."projects_environment_enum" AS ENUM('development', 'staging', 'production')`,
    );
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "environment" "public"."projects_environment_enum" NOT NULL DEFAULT 'production', "apiKeyHash" character varying NOT NULL, "apiKeyPrefix" character varying(16) NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_f63e2be2a1f3f36aeb21b4fdaaa" UNIQUE ("apiKeyHash"), CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_361a53ae58ef7034adc3c06f09" ON "projects"  ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_361a53ae58ef7034adc3c06f09f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_361a53ae58ef7034adc3c06f09f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_361a53ae58ef7034adc3c06f09"`,
    );
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TYPE "public"."projects_environment_enum"`);
  }
}
