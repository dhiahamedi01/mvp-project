import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFcmTokenToUser1703000000000 implements MigrationInterface {
  name = 'AddFcmTokenToUser1703000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'fcmToken',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'fcmToken');
  }
}