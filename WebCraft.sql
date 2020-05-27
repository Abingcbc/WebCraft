ALTER TABLE `GameFile` DROP FOREIGN KEY `fk_GameFile`;

DROP TABLE `User`;
DROP TABLE `GameFile`;

CREATE TABLE `User` (
`username` varchar(255) NOT NULL,
`password` varchar(255) NULL,
PRIMARY KEY (`username`) 
);
CREATE TABLE `GameFile` (
`fileId` int(11) NOT NULL,
`username` varchar(255) NULL,
`file` varchar(255) NULL,
PRIMARY KEY (`fileId`) 
);

ALTER TABLE `GameFile` ADD CONSTRAINT `fk_GameFile` FOREIGN KEY (`username`) REFERENCES `User` (`username`);

