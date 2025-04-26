import { MigrationInterface, QueryRunner } from "typeorm";

export class AI1745682092440 implements MigrationInterface {
    name = 'AI1745682092440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sub_teams\` ADD \`KnowledgeBaseId\` varchar(24) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sub_teams\` DROP COLUMN \`KnowledgeBaseId\``);
    }

}
