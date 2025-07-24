import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddReadByUsersToNotification1703000003000 implements MigrationInterface {
  name = 'AddReadByUsersToNotification1703000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'readByUsers',
        type: 'json',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('notifications', 'readByUsers');
  }
}