<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250527000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create notification table for mobile + web alerts';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
CREATE TABLE notification (
    id INT AUTO_INCREMENT NOT NULL,
    user_id INT NOT NULL,
    type VARCHAR(64) NOT NULL,
    message LONGTEXT NOT NULL,
    related_entity VARCHAR(64) DEFAULT NULL,
    related_id INT DEFAULT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
    INDEX IDX_NOTIFICATION_USER (user_id),
    INDEX IDX_NOTIFICATION_USER_READ (user_id, is_read),
    INDEX IDX_NOTIFICATION_CREATED (created_at),
    PRIMARY KEY(id),
    CONSTRAINT FK_NOTIFICATION_USER FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE notification');
    }
}
