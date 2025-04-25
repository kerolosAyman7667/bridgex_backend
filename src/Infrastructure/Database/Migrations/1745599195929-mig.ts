import { MigrationInterface, QueryRunner } from "typeorm";

export class Mig1745599195929 implements MigrationInterface {
    name = 'Mig1745599195929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`learning_phase_videos\` DROP FOREIGN KEY \`FK_102f11dfb7c47896f829d2b8539\``);
        await queryRunner.query(`CREATE TABLE \`learning_phase_resources\` (\`Name\` varchar(50) NOT NULL, \`SectionId\` varchar(32) NOT NULL, \`File\` varchar(500) NOT NULL, \`Id\` varchar(32) NOT NULL, \`CreatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`UpdatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`Id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`learning_phase_videos\` ADD CONSTRAINT \`FK_102f11dfb7c47896f829d2b8539\` FOREIGN KEY (\`SectionId\`) REFERENCES \`learning_phase_sections\`(\`Id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`learning_phase_resources\` ADD CONSTRAINT \`FK_4628caa2ef9fb3e00324f6c4464\` FOREIGN KEY (\`SectionId\`) REFERENCES \`learning_phase_sections\`(\`Id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`learning_phase_resources\` DROP FOREIGN KEY \`FK_4628caa2ef9fb3e00324f6c4464\``);
        await queryRunner.query(`ALTER TABLE \`learning_phase_videos\` DROP FOREIGN KEY \`FK_102f11dfb7c47896f829d2b8539\``);
        await queryRunner.query(`DROP TABLE \`learning_phase_resources\``);
        await queryRunner.query(`ALTER TABLE \`learning_phase_videos\` ADD CONSTRAINT \`FK_102f11dfb7c47896f829d2b8539\` FOREIGN KEY (\`SectionId\`) REFERENCES \`sub_teams\`(\`Id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
