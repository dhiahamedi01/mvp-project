import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsPublicToNotification1703000002000 implements MigrationInterface {
  name = 'AddIsPublicToNotification1703000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'isPublic',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('notifications', 'isPublic');
  }
}