import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDataToNotification1703000001000 implements MigrationInterface {
  name = 'AddDataToNotification1703000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "data" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "data"`);
  }
}