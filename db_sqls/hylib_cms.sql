-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.11-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              11.2.0.6213
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Copiando estrutura para tabela lella_cms.cms_news
CREATE TABLE IF NOT EXISTS `cms_news` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(50) DEFAULT NULL,
  `shortstory` varchar(50) DEFAULT NULL,
  `url_music` varchar(255) DEFAULT NULL,
  `category` set('Atividades','Promoções','Campanhas','Atualizações','Arquitetos em Ação','Gamers em Ação','Embaixadores','Geral') NOT NULL DEFAULT 'Geral',
  `image` text DEFAULT NULL,
  `longstory` text CHARACTER SET utf8 DEFAULT NULL,
  `date` int(11) DEFAULT NULL,
  `timestamp_expire` int(11) DEFAULT NULL,
  `roomid` varchar(50) DEFAULT '1',
  `type` varchar(50) DEFAULT '1',
  `author` text DEFAULT NULL,
  `rascunho` tinyint(1) NOT NULL DEFAULT 0,
  `limite_de_comentarios` tinyint(2) NOT NULL DEFAULT 5,
  `classificacao` tinyint(2) DEFAULT NULL,
  `active_campaign` enum('0','1') NOT NULL DEFAULT '0',
  `form` enum('0','1','2') NOT NULL DEFAULT '0',
  `updated` enum('0','1') NOT NULL DEFAULT '0',
  `use_badge` enum('0','1') NOT NULL DEFAULT '0',
  `comments` enum('0','1') NOT NULL DEFAULT '0',
  `badge_code` varchar(255) DEFAULT NULL,
  `form_field_1_title` varchar(255) DEFAULT NULL,
  `form_field_2_title` varchar(255) DEFAULT NULL,
  `color_html` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=577 DEFAULT CHARSET=latin1;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela lella_cms.cms_post_comments
CREATE TABLE IF NOT EXISTS `cms_post_comments` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `type` enum('undefined','article','errand') NOT NULL DEFAULT 'undefined',
  `post_id` int(11) DEFAULT 0,
  `value` text DEFAULT NULL,
  `author_id` int(11) DEFAULT 0,
  `to_user_id` int(11) NOT NULL DEFAULT 0,
  `timestamp` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela lella_cms.cms_post_reaction
CREATE TABLE IF NOT EXISTS `cms_post_reaction` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('undefined','article') NOT NULL DEFAULT 'undefined',
  `state` enum('undefined','like','deslike') NOT NULL DEFAULT 'undefined',
  `post_id` int(11) NOT NULL DEFAULT 0,
  `user_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=latin1;

ALTER TABLE `player_settings`
	ADD COLUMN `profile_picture` VARCHAR(255) NULL DEFAULT NULL AFTER `allow_sex`;
	
ALTER TABLE `player_settings`
	ADD COLUMN `profile_cover` VARCHAR(255) NULL DEFAULT NULL AFTER `profile_picture`;
-- Exportação de dados foi desmarcado.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
