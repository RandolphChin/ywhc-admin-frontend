SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for biz_enterprise
-- ----------------------------
DROP TABLE IF EXISTS `biz_enterprise`;
CREATE TABLE `biz_enterprise` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID / Identifiant / ID',
  `enterprise_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '企业名称 / Nom de l’entreprise / Enterprise name',
  `enterprise_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '企业地址 / Adresse de l’entreprise / Enterprise address',
  `dept_id` bigint NULL DEFAULT NULL COMMENT '数据权限-当前用户所在部门 / Portée des données — département de l’utilisateur / Data scope — user’s department',
  `status` tinyint NULL DEFAULT 1 COMMENT '企业状态：1-存续, 2-吊销, 3-吊销, 4-注销, 5-停业 / Statut de l’entreprise : 1=En activité, 2=Révoquée, 3=Révoquée, 4=Radiée, 5=En pause / Enterprise status: 1=Active, 2=Revoked, 3=Revoked, 4=Deregistered, 5=Suspended',
  `deleted` tinyint NULL DEFAULT 0 COMMENT '删除标志：0-正常，1-删除 / Indicateur de suppression : 0=actif, 1=supprimé / Deletion flag: 0=active, 1=deleted',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间 / Date de création / Created at',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间 / Date de mise à jour / Updated at',
  `create_by` bigint NULL DEFAULT NULL COMMENT '创建者 / Créé par / Created by',
  `update_by` bigint NULL DEFAULT NULL COMMENT '更新者 / Mis à jour par / Updated by',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='测试企业 / Entreprise de test / Test enterprise' ROW_FORMAT=Dynamic;

-- ----------------------------
-- Table structure for sys_dept
-- ----------------------------
DROP TABLE IF EXISTS `sys_dept`;
CREATE TABLE `sys_dept` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID / ID principal / Primary key ID',
  `parent_id` bigint NULL DEFAULT 0 COMMENT '父部门ID / ID du département parent / Parent department ID',
  `dept_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '部门名称 / Nom du département / Department name',
  `dept_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '部门编码 / Code du département / Department code',
  `dept_type` tinyint NULL DEFAULT 2 COMMENT '部门类型：1-公司，2-部门，3-小组 / Type de département : 1=Entreprise, 2=Département, 3=Équipe / Department type: 1=Company, 2=Department, 3=Team',
  `ancestors` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '0' COMMENT '祖级列表 / Liste des ancêtres / Ancestors list',
  `sort_order` int NULL DEFAULT 0 COMMENT '显示顺序 / Ordre d’affichage / Display order',
  `status` tinyint NULL DEFAULT 1 COMMENT '部门状态：0-停用，1-正常 / Statut du département : 0=désactivé, 1=actif / Department status: 0=disabled, 1=active',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注 / Remarque / Remark',
  `deleted` tinyint NULL DEFAULT 0 COMMENT '删除标志：0-正常，1-删除 / Indicateur de suppression : 0=actif, 1=supprimé / Deletion flag: 0=active, 1=deleted',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间 / Date de création / Created at',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间 / Date de mise à jour / Updated at',
  `create_by` bigint NULL DEFAULT NULL COMMENT '创建者 / Créé par / Created by',
  `update_by` bigint NULL DEFAULT NULL COMMENT '更新者 / Mis à jour par / Updated by',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_dept_code`(`dept_code`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_deleted`(`deleted`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统部门表 / Table des départements système / System department table' ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for sys_dict_data
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_data`;
CREATE TABLE `sys_dict_data` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '字典编码 / Code de dictionnaire / Dictionary entry ID',
  `lang` char(5) NOT NULL COMMENT '语言 / Langue / Language (e.g., zh-CN, fr-FR, en-US)',
  `dict_sort` int NULL DEFAULT 0 COMMENT '字典排序 / Ordre / Sort order',
  `dict_label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典标签 / Libellé / Label',
  `dict_value` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典键值 / Valeur / Value',
  `dict_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典类型 / Type de dictionnaire / Dictionary type',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注 / Remarque / Remark',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '删除标志（0正常 1删除）/ Indicateur de suppression (0=actif 1=supprimé) / Deletion flag (0=active 1=deleted)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_dict_type`(`dict_type`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典数据表 / Table des données de dictionnaire / Dictionary data table' ROW_FORMAT=Dynamic;

-- ----------------------------
-- Table structure for sys_dict_type
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_type`;
CREATE TABLE `sys_dict_type` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '字典类型ID / ID du type de dictionnaire / Dictionary type ID',
  `dict_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典名称 / Nom du dictionnaire / Dictionary name',
  `dict_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典类型 / Type de dictionnaire / Dictionary key',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注 / Remarque / Remark',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '删除标志（0正常 1删除）/ Indicateur de suppression (0=actif 1=supprimé) / Deletion flag (0=active 1=deleted)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_dict_type`(`dict_type`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典类型表 / Table des types de dictionnaire / Dictionary types table' ROW_FORMAT=Dynamic;

-- ----------------------------
-- Table structure for sys_log
-- ----------------------------
DROP TABLE IF EXISTS `sys_log`;
CREATE TABLE `sys_log` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID / ID principal / Primary key ID',
  `user_id` bigint NULL DEFAULT NULL COMMENT '操作用户ID / ID de l’utilisateur opérateur / Operating user ID',
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作用户名 / Nom d’utilisateur opérateur / Operating username',
  `create_by` bigint NULL DEFAULT NULL COMMENT '创建人ID / ID du créateur / Creator ID',
  `dept_id` bigint NULL DEFAULT NULL COMMENT '部门ID / ID du département / Department ID',
  `dept_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '部门名称 / Nom du département / Department name',
  `module` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作模块 / Module d’opération / Operation module',
  `operation_type` tinyint NULL DEFAULT NULL COMMENT '操作类型：1-新增，2-修改，3-删除，4-查询，5-登录，6-登出 / Type d’opération : 1=Créer, 2=Modifier, 3=Supprimer, 4=Consulter, 5=Connexion, 6=Déconnexion / Operation type: 1=Create, 2=Update, 3=Delete, 4=Query, 5=Login, 6=Logout',
  `operation_desc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作描述 / Description de l’opération / Operation description',
  `request_method` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '请求方法 / Méthode HTTP / HTTP method',
  `request_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '请求URL / URL de requête / Request URL',
  `request_params` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '请求参数 / Paramètres de requête / Request parameters',
  `response_result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '响应结果 / Résultat de la réponse / Response result',
  `execution_time` bigint NULL DEFAULT NULL COMMENT '执行时间(毫秒) / Temps d’exécution (ms) / Execution time (ms)',
  `status` tinyint NULL DEFAULT 1 COMMENT '操作状态：0-失败，1-成功 / Statut de l’opération : 0=échec, 1=succès / Operation status: 0=fail, 1=success',
  `error_msg` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '错误信息 / Message d’erreur / Error message',
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作IP / IP de l’opération / Operation IP',
  `user_agent` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户代理 / Agent utilisateur / User agent',
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作地点 / Localisation / Location',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间 / Date de création / Created at',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_username`(`username`) USING BTREE,
  INDEX `idx_module`(`module`) USING BTREE,
  INDEX `idx_operation_type`(`operation_type`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE,
  INDEX `idx_create_by`(`create_by`) USING BTREE,
  INDEX `idx_dept_id`(`dept_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2716 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表 / Table des journaux d’opération / Operation log table' ROW_FORMAT=Dynamic;

-- ----------------------------
-- Table structure for sys_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_menu`;
CREATE TABLE `sys_menu` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID / ID principal / Primary key ID',
  `parent_id` bigint NULL DEFAULT 0 COMMENT '父菜单ID / ID du menu parent / Parent menu ID',
  `menu_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '菜单名称 / Nom du menu / Menu name',
  `menu_type` tinyint NOT NULL COMMENT '菜单类型：0-目录，1-菜单，2-按钮 / Type de menu : 0=Répertoire, 1=Menu, 2=Bouton / Menu type: 0=Directory, 1=Menu, 2=Button',
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '路由路径 / Chemin de routage / Route path',
  `component` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '组件路径 / Chemin du composant / Component path',
  `permission` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '权限标识 / Identifiant de permission / Permission key',
  `icon` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '图标 / Icône / Icon',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序 / Ordre / Sort order',
  `is_external` tinyint NULL DEFAULT 0 COMMENT '是否外链：0-否，1-是 / Lien externe ? 0=Non, 1=Oui / External link? 0=No, 1=Yes',
  `is_cache` tinyint NULL DEFAULT 1 COMMENT '是否缓存：0-否，1-是 / Mis en cache ? 0=Non, 1=Oui / Cached? 0=No, 1=Yes',
  `is_visible` tinyint NULL DEFAULT 1 COMMENT '是否显示：0-隐藏，1-显示 / Visible ? 0=Masqué, 1=Visible / Visible? 0=Hidden, 1=Visible',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态：0-禁用，1-正常 / Statut : 0=désactivé, 1=actif / Status: 0=disabled, 1=active',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注 / Remarque / Remark',
  `deleted` tinyint NULL DEFAULT 0 COMMENT '删除标志：0-正常，1-删除 / Indicateur de suppression : 0=actif, 1=supprimé / Deletion flag: 0=active, 1=deleted',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间 / Date de création / Created at',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间 / Date de mise à jour / Updated at',
  `create_by` bigint NULL DEFAULT NULL COMMENT '创建者 / Créé par / Created by',
  `update_by` bigint NULL DEFAULT NULL COMMENT '更新者 / Mis à jour par / Updated by',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_sort_order`(`sort_order`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1029 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单表 / Table des menus / Menu table' ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for sys_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID / ID principal / Primary key ID',
  `role_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名称 / Nom du rôle / Role name',
  `role_key` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色标识 / Identifiant du rôle / Role key',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '角色描述 / Description du rôle / Role description',
  `data_scope` tinyint NULL DEFAULT 1 COMMENT '数据权限范围：1-全部数据，2-自定部门数据，3-本部门数据，4-本部门及以下数据，5-仅本人数据 / Portée des données : 1=Toutes, 2=Départements définis, 3=Département actuel, 4=Département et sous-départements, 5=Utilisateur seul / Data scope: 1=All, 2=Custom depts, 3=Dept only, 4=Dept & below, 5=Self only',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序 / Ordre / Sort order',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态：0-禁用，1-正常 / Statut : 0=désactivé, 1=actif / Status: 0=disabled, 1=active',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注 / Remarque / Remark',
  `deleted` tinyint NULL DEFAULT 0 COMMENT '删除标志：0-正常，1-删除 / Indicateur de suppression : 0=actif, 1=supprimé / Deletion flag: 0=active, 1=deleted',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间 / Date de création / Created at',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间 / Date de mise à jour / Updated at',
  `create_by` bigint NULL DEFAULT NULL COMMENT '创建者 / Créé par / Created by',
  `update_by` bigint NULL DEFAULT NULL COMMENT '更新者 / Mis à jour par / Updated by',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_role_key`(`role_key`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_sort_order`(`sort_order`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表 / Table des rôles / Role table' ROW_FORMAT=Dynamic;

-- ----------------------------
-- Table structure for sys_role_dept
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_dept`;
CREATE TABLE `sys_role_dept` (
  `role_id` bigint NOT NULL COMMENT '角色ID / ID du rôle / Role ID',
  `dept_id` bigint NOT NULL COMMENT '部门ID / ID du département / Department ID',
  PRIMARY KEY (`role_id`, `dept_id`) USING BTREE,
  INDEX `idx_role_id`(`role_id`) USING BTREE,
  INDEX `idx_dept_id`(`dept_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色和部门关联表 / Table d’association rôles-départements / Role-department link table' ROW_FORMAT=Dynamic;

-- ----------------------------
-- Table structure for sys_role_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_menu`;
CREATE TABLE `sys_role_menu` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID / ID principal / Primary key ID',
  `role_id` bigint NOT NULL COMMENT '角色ID / ID du rôle / Role ID',
  `menu_id` bigint NOT NULL COMMENT '菜单ID / ID du menu / Menu ID',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间 / Date de création / Created at',
  `create_by` bigint NULL DEFAULT NULL COMMENT '创建者 / Créé par / Created by',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_role_menu`(`role_id`, `menu_id`) USING BTREE,
  INDEX `idx_role_id`(`role_id`) USING BTREE,
  INDEX `idx_menu_id`(`menu_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=467 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色菜单权限关联表 / Table d’association rôles-menus / Role-menu permission link table' ROW_FORMAT=Dynamic;

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID / ID principal / Primary key ID',
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名 / Nom d’utilisateur / Username',
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码 / Mot de passe / Password',
  `nickname` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '昵称 / Surnom / Nickname',
  `email` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮箱 / E-mail / Email',
  `mobile` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号 / Téléphone mobile / Mobile phone',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '头像 / Avatar / Avatar',
  `gender` tinyint NULL DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女 / Sexe : 0=Inconnu, 1=Homme, 2=Femme / Gender: 0=Unknown, 1=Male, 2=Female',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态：0-禁用，1-正常 / Statut : 0=désactivé, 1=actif / Status: 0=disabled, 1=active',
  `last_login_time` datetime NULL DEFAULT NULL COMMENT '最后登录时间 / Dernière connexion / Last login time',
  `last_login_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后登录IP / Dernière IP de connexion / Last login IP',
  `dept_id` bigint NULL DEFAULT NULL COMMENT '部门ID / ID du département / Department ID',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注 / Remarque / Remark',
  `deleted` tinyint NULL DEFAULT 0 COMMENT '删除标志：0-正常，1-删除 / Indicateur de suppression : 0=actif, 1=supprimé / Deletion flag: 0=active, 1=deleted',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间 / Date de création / Created at',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间 / Date de mise à jour / Updated at',
  `create_by` bigint NULL DEFAULT NULL COMMENT '创建者 / Créé par / Created by',
  `update_by` bigint NULL DEFAULT NULL COMMENT '更新者 / Mis à jour par / Updated by',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE,
  INDEX `idx_dept_id`(`dept_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表 / Table des utilisateurs / User table' ROW_FORMAT=Dynamic;

-- ----------------------------
-- Table structure for sys_user_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID / ID principal / Primary key ID',
  `user_id` bigint NOT NULL COMMENT '用户ID / ID de l’utilisateur / User ID',
  `role_id` bigint NOT NULL COMMENT '角色ID / ID du rôle / Role ID',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间 / Date de création / Created at',
  `create_by` bigint NULL DEFAULT NULL COMMENT '创建者 / Créé par / Created by',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_role`(`user_id`, `role_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_role_id`(`role_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表 / Table d’association utilisateurs-rôles / User-role link table' ROW_FORMAT=Dynamic;

-- ----------------------------
-- Table structure for sys_i18n
-- ----------------------------
DROP TABLE IF EXISTS `sys_i18n`;
CREATE TABLE `sys_i18n` (
  `i18n_key` char(100) NOT NULL COMMENT '翻译键 / Clé de traduction / Translation key',
  `lang` char(5) NOT NULL COMMENT '语言 / Langue / Language (e.g., zh-CN, fr-FR, en-US)',
  `translation` text NOT NULL COMMENT '翻译内容 / Traduction / Translation text',
  `context` varchar(100) NULL DEFAULT NULL COMMENT '上下文或来源表 / Contexte ou table source / Context or source table',
  `source` varchar(50) NULL DEFAULT 'sql_dump' COMMENT '来源 / Origine / Source',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间 / Date de mise à jour / Last update',
  PRIMARY KEY (`i18n_key`, `lang`),
  INDEX `idx_context` (`context`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='多语言翻译表 / Table de traduction i18n / i18n translation table';

SET FOREIGN_KEY_CHECKS = 1;


