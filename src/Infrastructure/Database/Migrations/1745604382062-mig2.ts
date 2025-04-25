import { MigrationInterface, QueryRunner } from "typeorm";

export class Mig21745604382062 implements MigrationInterface {
    name = 'Mig21745604382062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`learning_phase_videos\` CHANGE \`Duration\` \`Duration\` decimal(12,2) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`learning_phase_videos\` CHANGE \`Duration\` \`Duration\` decimal(2,0) NULL`);
    }

}
