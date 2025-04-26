import { MigrationInterface, QueryRunner } from "typeorm";

export class Ai1745615670698 implements MigrationInterface {
    name = 'Ai1745615670698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_progress\` CHANGE \`WatchDuration\` \`WatchDuration\` decimal(12,2) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_progress\` CHANGE \`WatchDuration\` \`WatchDuration\` decimal(2,0) NULL`);
    }

}
