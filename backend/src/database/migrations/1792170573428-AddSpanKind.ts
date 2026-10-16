import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpanKind1792170573428 implements MigrationInterface {
  name = 'AddSpanKind1792170573428';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."spans_kind_enum" AS ENUM('server', 'client', 'internal')`,
    );
    await queryRunner.query(
      `ALTER TABLE "spans" ADD "kind" "public"."spans_kind_enum" NOT NULL DEFAULT 'internal'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "spans" DROP COLUMN "kind"`);
    await queryRunner.query(`DROP TYPE "public"."spans_kind_enum"`);
  }
}
