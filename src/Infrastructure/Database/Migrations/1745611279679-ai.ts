import { MigrationInterface, QueryRunner } from "typeorm";

export class Ai1745611279679 implements MigrationInterface {
    name = 'Ai1745611279679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sub_teams\` ADD \`KnowledgeBaseId\` varchar(24) NULL`);
        await queryRunner.query(`ALTER TABLE \`learning_phase_resources\` ADD \`AIAssetId\` varchar(24) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`learning_phase_resources\` DROP COLUMN \`AIAssetId\``);
        await queryRunner.query(`ALTER TABLE \`sub_teams\` DROP COLUMN \`KnowledgeBaseId\``);
    }

}
