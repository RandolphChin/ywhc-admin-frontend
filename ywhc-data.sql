/* ============================================================================
   Bloc 0 — Préambule / notes
   ----------------------------------------------------------------------------
   🇨🇳: 本 SQL 脚本将菜单名称（menu_name）国际化为 i18n 键，并把中文/法语/英语翻译存入 sys_i18n 表。
   🇫🇷: Ce script SQL internationalise menu_name (remplacé par une clé i18n) et stocke les traductions (zh-CN, fr-FR, en-US) dans sys_i18n.
   🇬🇧: This SQL script internationalizes menu_name (replaced by an i18n key) and stores translations (zh-CN, fr-FR, en-US) in sys_i18n.
   ----------------------------------------------------------------------------
   Règles:
     - clé i18n: menu.<id>.<type>   (type: dir | menu | btn)
     - table sys_i18n: (i18n_key, lang, translation)
     - sys_menu.menu_name => stocke la clé i18n (ex: 'menu.2.menu')
     - remark reste inchangé dans sys_menu (chinois), mais ses traductions sont aussi ajoutées dans sys_i18n
   ============================================================================ */


-- ----------------------------
-- Records of biz_enterprise
-- ----------------------------

INSERT INTO `biz_enterprise` VALUES (7, '卡普空株式会社', '800 Concar Dr., #300,San Mateo CA 94402', 2, 2, 0, '2025-09-28 17:54:41', '2025-09-28 18:22:43', 1, 1);
INSERT INTO `biz_enterprise` VALUES (8, '胖东来生活广场', '许昌市魏都区南关大街42号', 2, 1, 0, '2025-09-28 18:28:40', '2025-09-28 18:28:40', 1, 1);
INSERT INTO `biz_enterprise` VALUES (9, '瑞贝卡', '瑞贝卡大道008号', 3, 1, 0, '2025-09-30 08:53:58', '2025-09-30 08:53:58', 2, 2);

-- ----------------------------
-- Records of sys_dept (français dans dept_name et ancestors)
-- ----------------------------

INSERT INTO `sys_dept` VALUES (2, 0, 'Département technique', 'TECH', 2, '0', 1, 1, 'Département de recherche et développement technique', 0, '2025-09-07 17:55:55', '2025-09-12 16:02:21', NULL, NULL);
INSERT INTO `sys_dept` VALUES (3, 0, 'Département marketing', 'MARKET', 2, '0', 2, 1, 'Département de marketing et communication', 0, '2025-09-07 17:55:55', '2025-09-14 11:22:15', NULL, 1);
INSERT INTO `sys_dept` VALUES (4, 0, 'Département des ressources humaines', 'HR', 2, '0', 3, 1, 'Département de gestion du personnel et des ressources humaines', 0, '2025-09-07 17:55:55', '2025-09-12 16:02:21', NULL, NULL);
INSERT INTO `sys_dept` VALUES (5, 2, 'Équipe Frontend', 'FRONTEND', 3, '0,Département technique', 1, 1, 'Équipe de développement front-end', 0, '2025-09-07 17:55:55', '2025-09-12 16:02:21', NULL, NULL);
INSERT INTO `sys_dept` VALUES (6, 2, 'Équipe Backend', 'BACKEND', 3, '0,Département technique', 2, 1, 'Équipe de développement back-end', 0, '2025-09-07 17:55:55', '2025-09-12 16:02:21', NULL, NULL);
INSERT INTO `sys_dept` VALUES (7, 0, 'Département sécurité et qualité', 'ZLGL', 2, '0', 10, 1, NULL, 0, '2025-09-13 21:45:59', '2025-09-19 18:14:20', 1, 1);
INSERT INTO `sys_dept` VALUES (8, 0, 'Département financier', 'CYB', 2, '0', 20, 1, NULL, 0, '2025-09-14 11:20:29', '2025-09-14 11:20:29', 1, 1);
INSERT INTO `sys_dept` VALUES (9, 3, 'Service de marketing opérationnel', 'SCYY', 2, '0,Département marketing', 1, 1, NULL, 1, '2025-09-14 11:21:33', '2025-09-14 11:21:47', 1, 1);
INSERT INTO `sys_dept` VALUES (10, 7, 'Unité de contrôle qualité', 'ZHI_LIANG_XI', 3, '0,Département sécurité et qualité', 1, 1, 'Groupe de supervision qualité et sécurité', 1, '2025-09-19 18:20:22', '2025-09-19 18:21:20', 1, 1);

-- ----------------------------
-- Records of sys_dict_data (multi-langue)
-- ----------------------------

-- 🌐 Request Methods
INSERT INTO `sys_dict_data` VALUES (1, 'zh-CN', 1, 'GET', '0', 'request_methods', 'GET方法', 0);
INSERT INTO `sys_dict_data` VALUES (2, 'fr-FR', 1, 'GET', '0', 'request_methods', 'Méthode GET', 0);
INSERT INTO `sys_dict_data` VALUES (3, 'en-US', 1, 'GET', '0', 'request_methods', 'HTTP GET Method', 0);

INSERT INTO `sys_dict_data` VALUES (4, 'zh-CN', 2, 'POST', '1', 'request_methods', 'POST方法', 0);
INSERT INTO `sys_dict_data` VALUES (5, 'fr-FR', 2, 'POST', '1', 'request_methods', 'Méthode POST', 0);
INSERT INTO `sys_dict_data` VALUES (6, 'en-US', 2, 'POST', '1', 'request_methods', 'HTTP POST Method', 0);

INSERT INTO `sys_dict_data` VALUES (7, 'zh-CN', 3, 'PUT', '2', 'request_methods', 'PUT方法', 0);
INSERT INTO `sys_dict_data` VALUES (8, 'fr-FR', 3, 'PUT', '2', 'request_methods', 'Méthode PUT', 0);
INSERT INTO `sys_dict_data` VALUES (9, 'en-US', 3, 'PUT', '2', 'request_methods', 'HTTP PUT Method', 0);

INSERT INTO `sys_dict_data` VALUES (10, 'zh-CN', 4, 'DELETE', '3', 'request_methods', 'DELETE方法', 0);
INSERT INTO `sys_dict_data` VALUES (11, 'fr-FR', 4, 'DELETE', '3', 'request_methods', 'Méthode DELETE', 0);
INSERT INTO `sys_dict_data` VALUES (12, 'en-US', 4, 'DELETE', '3', 'request_methods', 'HTTP DELETE Method', 0);

-- 👤 User sex
INSERT INTO `sys_dict_data` VALUES (13, 'zh-CN', 1, '未知', '2', 'sys_user_sex', '性别未知', 0);
INSERT INTO `sys_dict_data` VALUES (14, 'fr-FR', 1, 'Inconnu', '2', 'sys_user_sex', 'Sexe non défini', 0);
INSERT INTO `sys_dict_data` VALUES (15, 'en-US', 1, 'Unknown', '2', 'sys_user_sex', 'Undefined gender', 0);

-- 👁️ Show / Hide menu
INSERT INTO `sys_dict_data` VALUES (16, 'zh-CN', 1, '显示', '0', 'sys_show_hide', '显示菜单', 0);
INSERT INTO `sys_dict_data` VALUES (17, 'fr-FR', 1, 'Afficher', '0', 'sys_show_hide', 'Afficher le menu', 0);
INSERT INTO `sys_dict_data` VALUES (18, 'en-US', 1, 'Show', '0', 'sys_show_hide', 'Show menu', 0);

INSERT INTO `sys_dict_data` VALUES (19, 'zh-CN', 2, '隐藏', '1', 'sys_show_hide', '隐藏菜单', 0);
INSERT INTO `sys_dict_data` VALUES (20, 'fr-FR', 2, 'Masquer', '1', 'sys_show_hide', 'Masquer le menu', 0);
INSERT INTO `sys_dict_data` VALUES (21, 'en-US', 2, 'Hide', '1', 'sys_show_hide', 'Hide menu', 0);

-- ⚙️ Operation types
INSERT INTO `sys_dict_data` VALUES (22, 'zh-CN', 1, '新增', '1', 'sys_oper_type', '新增操作', 0);
INSERT INTO `sys_dict_data` VALUES (23, 'fr-FR', 1, 'Ajouter', '1', 'sys_oper_type', 'Opération d’ajout', 0);
INSERT INTO `sys_dict_data` VALUES (24, 'en-US', 1, 'Add', '1', 'sys_oper_type', 'Add operation', 0);

INSERT INTO `sys_dict_data` VALUES (25, 'zh-CN', 2, '修改', '2', 'sys_oper_type', '修改操作', 0);
INSERT INTO `sys_dict_data` VALUES (26, 'fr-FR', 2, 'Modifier', '2', 'sys_oper_type', 'Opération de modification', 0);
INSERT INTO `sys_dict_data` VALUES (27, 'en-US', 2, 'Edit', '2', 'sys_oper_type', 'Edit operation', 0);

INSERT INTO `sys_dict_data` VALUES (28, 'zh-CN', 3, '删除', '3', 'sys_oper_type', '删除操作', 0);
INSERT INTO `sys_dict_data` VALUES (29, 'fr-FR', 3, 'Supprimer', '3', 'sys_oper_type', 'Opération de suppression', 0);
INSERT INTO `sys_dict_data` VALUES (30, 'en-US', 3, 'Delete', '3', 'sys_oper_type', 'Delete operation', 0);

INSERT INTO `sys_dict_data` VALUES (31, 'zh-CN', 4, '授权', '4', 'sys_oper_type', '授权操作', 0);
INSERT INTO `sys_dict_data` VALUES (32, 'fr-FR', 4, 'Autoriser', '4', 'sys_oper_type', 'Opération d’autorisation', 0);
INSERT INTO `sys_dict_data` VALUES (33, 'en-US', 4, 'Authorize', '4', 'sys_oper_type', 'Authorization operation', 0);

INSERT INTO `sys_dict_data` VALUES (34, 'zh-CN', 5, '导出', '5', 'sys_oper_type', '导出操作', 0);
INSERT INTO `sys_dict_data` VALUES (35, 'fr-FR', 5, 'Exporter', '5', 'sys_oper_type', 'Opération d’exportation', 0);
INSERT INTO `sys_dict_data` VALUES (36, 'en-US', 5, 'Export', '5', 'sys_oper_type', 'Export operation', 0);

INSERT INTO `sys_dict_data` VALUES (37, 'zh-CN', 6, '导入', '6', 'sys_oper_type', '导入操作', 0);
INSERT INTO `sys_dict_data` VALUES (38, 'fr-FR', 6, 'Importer', '6', 'sys_oper_type', 'Opération d’importation', 0);
INSERT INTO `sys_dict_data` VALUES (39, 'en-US', 6, 'Import', '6', 'sys_oper_type', 'Import operation', 0);

INSERT INTO `sys_dict_data` VALUES (40, 'zh-CN', 7, '强退', '7', 'sys_oper_type', '强退操作', 0);
INSERT INTO `sys_dict_data` VALUES (41, 'fr-FR', 7, 'Déconnexion forcée', '7', 'sys_oper_type', 'Opération de déconnexion forcée', 0);
INSERT INTO `sys_dict_data` VALUES (42, 'en-US', 7, 'Force Logout', '7', 'sys_oper_type', 'Forced logout operation', 0);

INSERT INTO `sys_dict_data` VALUES (43, 'zh-CN', 8, '生成代码', '8', 'sys_oper_type', '生成操作', 0);
INSERT INTO `sys_dict_data` VALUES (44, 'fr-FR', 8, 'Générer du code', '8', 'sys_oper_type', 'Opération de génération de code', 0);
INSERT INTO `sys_dict_data` VALUES (45, 'en-US', 8, 'Generate Code', '8', 'sys_oper_type', 'Code generation operation', 0);

INSERT INTO `sys_dict_data` VALUES (46, 'zh-CN', 9, '清空数据', '9', 'sys_oper_type', '清空操作', 0);
INSERT INTO `sys_dict_data` VALUES (47, 'fr-FR', 9, 'Vider les données', '9', 'sys_oper_type', 'Opération de nettoyage des données', 0);
INSERT INTO `sys_dict_data` VALUES (48, 'en-US', 9, 'Clear Data', '9', 'sys_oper_type', 'Data clearing operation', 0);

-- ✅ Response status
INSERT INTO `sys_dict_data` VALUES (49, 'zh-CN', 1, '成功', '1', 'response_status', '成功状态', 0);
INSERT INTO `sys_dict_data` VALUES (50, 'fr-FR', 1, 'Succès', '1', 'response_status', 'Statut de réussite', 0);
INSERT INTO `sys_dict_data` VALUES (51, 'en-US', 1, 'Success', '1', 'response_status', 'Success state', 0);

INSERT INTO `sys_dict_data` VALUES (52, 'zh-CN', 2, '失败', '0', 'response_status', '失败状态', 0);
INSERT INTO `sys_dict_data` VALUES (53, 'fr-FR', 2, 'Échec', '0', 'response_status', 'Statut d’échec', 0);
INSERT INTO `sys_dict_data` VALUES (54, 'en-US', 2, 'Failure', '0', 'response_status', 'Failure state', 0);

-- 🏢 Enterprise status
INSERT INTO `sys_dict_data` VALUES (55, 'zh-CN', 1, '存续', '1', 'enterprise_status', '企业正在经营', 0);
INSERT INTO `sys_dict_data` VALUES (56, 'fr-FR', 1, 'En activité', '1', 'enterprise_status', 'Entreprise active', 0);
INSERT INTO `sys_dict_data` VALUES (57, 'en-US', 1, 'Active', '1', 'enterprise_status', 'Enterprise currently operating', 0);

INSERT INTO `sys_dict_data` VALUES (58, 'zh-CN', 2, '停业', '2', 'enterprise_status', '企业暂停经营', 0);
INSERT INTO `sys_dict_data` VALUES (59, 'fr-FR', 2, 'En pause', '2', 'enterprise_status', 'Entreprise temporairement inactive', 0);
INSERT INTO `sys_dict_data` VALUES (60, 'en-US', 2, 'Suspended', '2', 'enterprise_status', 'Enterprise temporarily closed', 0);

INSERT INTO `sys_dict_data` VALUES (61, 'zh-CN', 3, '吊销', '3', 'enterprise_status', '营业执照被吊销', 0);
INSERT INTO `sys_dict_data` VALUES (62, 'fr-FR', 3, 'Révoquée', '3', 'enterprise_status', 'Licence d’exploitation révoquée', 0);
INSERT INTO `sys_dict_data` VALUES (63, 'en-US', 3, 'Revoked', '3', 'enterprise_status', 'Business license revoked', 0);

INSERT INTO `sys_dict_data` VALUES (64, 'zh-CN', 4, '注销', '4', 'enterprise_status', '企业已注销', 0);
INSERT INTO `sys_dict_data` VALUES (65, 'fr-FR', 4, 'Radiée', '4', 'enterprise_status', 'Entreprise radiée', 0);
INSERT INTO `sys_dict_data` VALUES (66, 'en-US', 4, 'Deregistered', '4', 'enterprise_status', 'Enterprise deregistered', 0);

-- ----------------------------
-- Records of sys_dict_type
-- ----------------------------
INSERT INTO `sys_dict_type` VALUES (1, 'dict.type.request_methods', 'request_methods', 'ZH: 请求方法列表 - FR: Liste des méthodes HTTP - EN: HTTP methods list', 0);
INSERT INTO `sys_dict_type` VALUES (9, 'dict.type.sys_oper_type', 'sys_oper_type', 'ZH: 操作类型列表 - FR: Liste des types d’opérations - EN: Operation types list', 0);
INSERT INTO `sys_dict_type` VALUES (10, 'dict.type.response_status', 'response_status', 'ZH: 系统响应状态列表 - FR: Liste des statuts de réponse système - EN: System response status list', 0);
INSERT INTO `sys_dict_type` VALUES (11, 'dict.type.enterprise_status', 'enterprise_status', 'ZH: 企业状态列表 - FR: Liste des statuts d’entreprise - EN: Enterprise status list', 0);

-- ----------------------------
-- Records of sys_log
-- ----------------------------
INSERT INTO `sys_log` VALUES (1, 1, 'admin', 1, 2, '技术部', '创建菜单', 1, '创建菜单', 'POST', '/api/system/menu', 'Args: createDTO=MenuCreateDTO(parentId=1009, menuName=son3, menuType=1, path=testFoler/son3, component=/testFoler/son3, permission=null, icon=null, sortOrder=3, isExternal=0, isCache=1, isVisible=1, status=1, remark=null); ', '{\"code\":200,\"message\":\"菜单创建成功\",\"data\":\"1011\",\"timestamp\":\"2025-09-13T15:41:31.516857\",\"success\":true}', 5938, 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', NULL, '2025-09-13 15:41:26');
INSERT INTO `sys_log` VALUES (2715, 1, 'admin', 1, 2, '技术部', '代码生成', 7, '生成并下载代码', 'POST', '/api/generator/download', 'Args: config=GeneratorConfigDTO(tableName=biz_enterprise, moduleName=test, businessName=enterprise, functionName=测试企业, author=YWHC Team, packageName=com.ywhc.admin, generateOptions=GeneratorConfigDTO.GenerateOptions(generateController=true, generateService=true, generateServiceImpl=true, generateMapper=true, generateMapperXml=true, generateEntity=true, generateDto=true, generateVo=true, generateVuePage=true, generateVueApi=true, generateMenuSql=true, generatePermissionSql=true)); ', '{\"headers\":{\"Content-Disposition\":[\"attachment; filename=\\\"enterprise_code.zip\\\"\"],\"Content-Type\":[\"application/octet-stream\"]},\"body\":\"UEsDBBQACAgIAMtSPlsAAAAAAAAAAAAAAABhAAAAYmFja2VuZC9zcmMvbWFpbi9qYXZhL2NvbS95d2hjL2FkbWluL21vZHVsZXMvdGVzdC9lbnRlcnByaXNlL2NvbnRyb2xsZXIvRW50ZXJwcmlzZUNvbnRyb2xsZXIuamF2Yc2Yb28TNxjA31fqd7DuDZcOXATai9FStSTRiNSS0B5saEyVc2cSr3fnw/alZAhpEwLKpkFfjE1dt/FnY+MVRdqYgCHty5C0/RazL2ni9C7NpVRsUdXm7OeP+/ye57HPAbKXUAUDm3qwvly1IXI84kOPOqGLORSYC4h9gVnACMfQpr5g1HUxmxgdGR0hXkCZiJTLiHrEoSH06mUkCA/ckEtxhqGHBXKQQLBQkp4merRSuOSY1YiNYb4ztNAaGdqSI6hmJcswEjhnFd/SzrnAORA7Z0PM6vsxU9OtnO+vLx896kOGeegKOB/9GSSMfJ8KiVN+naWVGdvGnA+hk5PYS5h5hHP5OEgR+6HHYTHALNK26oHGmFDIl1GlghmsHYcUcc2PppRWQaAKhxaqdOVd6pXpkozL5ZAw7MywCs9KScFCW1DWlaOsArmMtV+5xJCHlylbkjlqh4yIOkRRhGDAcEAlpRLDM6GoUkY+x3tbWMZlWCa+o0dvbG+VqhCBwhjIVWKZAdJ/CoXT8tdpjBzMeArpOewQ1AbRkf4MLSEm67mGXOK0lnpefZ3QJGoIhoK4cJZwEemOj42NjoAx0Hz+9dbGvTevv3zz4ofmnd8bK3811p6omWh2GkXhAhc+Op0FFkZea5QT38bg2NFj7x85+sGR40fV6PjoyLQEaPpyweAkMHTDm08fbq7eNA4DB3ObkUCtMVlmc/1F48YfzTuPG3d/MTLSpAyoyHa6XDRwOZRjcygIZHxMY1zV33i3/tpaiVkzOhKEZZfYwHYR50BrPh0P4KqKDpAfOVGTnQRcIj5yQazdAZzQAFua053aNCWTsBWO+4+3Nh7p/3Bj5futh09kUFqNpG/MqF6AUqqnIOHZc/n5C5m2386UyUPPQ6yujDZWbm4/fN7X/47uh1iLaSB3hs6MXjWmUUW8/STq5iEV/BPdSJxwZX4dyuyojo+D6d6eYzo4EAUnS93Qi1JAPS8Sx8gA0Lz3rPnN0+ZP17fXVtsIWrRavXEy2q8m9d46NQXUSrtD3Iw3cCD7ekZhBe1Pgp3IjFxOjCncbV8Zm+jaYliEzG+vEPKwRV0p7Uhd+39mRdvz7S+aP95OmxUK7jvOiqQ8UD1sdxooD0OmQdxMZCUxC3abT5UFSmmfWbC18Vvz+o13kAUPXsqSK+T6riAxD64S59q+8uCyYtFNhF6svSgqWAu4OV1ConoeMYLKMhqz1K8A4vTQ1LU1gPIhiWeP9VP1gmNKcwOB6mbTgf3uWePRz3pY3xZpdj4/Y+X3Zhp32mFFOxvnPughx+nHbkGow8oUsKNDvA4uOomAnV37FHXq+ra7c+aPFWccWcx0qho0envbeuPvV82V1cZX941UAN/887T57cuDBHiulBsEMMFpB2D4Fvzk2VEMAhhGb0+pAXZetlIAjJkeHmBz/U+Z3cMAbKw82F779SAB5vKz+QEAE5zuyOewiwU+gFbKsEdreBBOJ3I3VCONg4sZSdMrdxVeFJAhuDVvv9y+dfc/odfXdT+GZSTs6juEyM2eaozOMYrklETJh2fJhy1CPT7DlOLG68atVwcJM/9xqThv7V2KcacJm6GEiK+oN+V9UWypJlHUrgImy3WBP/l0CrSk+9JMcXBtWQLqDi/xcBP30O60SZi1JUK6ZGa6MuoDq9HVhKndUsBs8YyVP2Mt5goLpeJCwSoU...', 129, 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', NULL, '2025-09-30 10:22:22');

-- ----------------------------
-- Records of sys_menu
-- ----------------------------

-- 系统管理 / Gestion du système / System Management 1
INSERT INTO `sys_menu` VALUES (1, 0, 'menu.dir.system', 0, '/system', NULL, 'system:manage', 'settings', 1, 0, 1, 1, 1, 'ZH: 系统管理目录 - FR: Répertoire de gestion du système - EN: System Management Directory', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);

-- 用户管理 / Gestion des utilisateurs / User Management 6
INSERT INTO `sys_menu` VALUES (2, 1, 'menu.page.system.user', 1, '/system/user', 'system/user', 'system:user:list', 'people', 1, 0, 1, 1, 1, 'ZH: 用户管理菜单 - FR: Menu de gestion des utilisateurs - EN: User Management Menu', 0, '2025-08-17 15:42:01', '2025-09-01 16:48:22', 1, 1);
INSERT INTO `sys_menu` VALUES (11, 2, 'menu.btn.system.user.add', 2, NULL, NULL, 'system:user:add', NULL, 1, 0, 1, 1, 1, 'ZH: 用户新增按钮 - FR: Bouton Ajouter un utilisateur - EN: Add User button', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);
INSERT INTO `sys_menu` VALUES (12, 2, 'menu.btn.system.user.edit', 2, NULL, NULL, 'system:user:edit', NULL, 2, 0, 1, 1, 1, 'ZH: 用户修改按钮 - FR: Bouton Modifier l’utilisateur - EN: Edit User button', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);
INSERT INTO `sys_menu` VALUES (13, 2, 'menu.btn.system.user.delete', 2, NULL, NULL, 'system:user:delete', NULL, 3, 0, 1, 1, 1, 'ZH: 用户删除按钮 - FR: Bouton Supprimer l’utilisateur - EN: Delete User button', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);
INSERT INTO `sys_menu` VALUES (14, 2, 'menu.btn.system.user.export', 2, NULL, NULL, 'system:user:export', NULL, 4, 0, 1, 1, 1, 'ZH: 用户导出按钮 - FR: Bouton Exporter les utilisateurs - EN: Export Users button', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);
INSERT INTO `sys_menu` VALUES (15, 2, 'menu.btn.system.user.resetPwd', 2, NULL, NULL, 'system:user:resetPwd', NULL, 5, 0, 1, 1, 1, 'ZH: 重置密码按钮 - FR: Bouton Réinitialiser le mot de passe - EN: Reset Password button', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);

-- 角色管理 / Gestion des rôles / Role Management 5
INSERT INTO `sys_menu` VALUES (3, 1, 'menu.page.system.role', 1, '/system/role', 'system/role', 'system:role:list', 'assignment_ind', 2, 0, 1, 1, 1, 'ZH: 角色管理菜单 - FR: Menu de gestion des rôles - EN: Role Management Menu', 0, '2025-08-17 15:42:01', '2025-09-01 16:48:22', 1, 1);
INSERT INTO `sys_menu` VALUES (21, 3, 'menu.btn.system.role.add', 2, NULL, NULL, 'system:role:add', NULL, 1, 0, 1, 1, 1, 'ZH: 角色新增按钮 - FR: Bouton Ajouter un rôle - EN: Add Role button', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);
INSERT INTO `sys_menu` VALUES (22, 3, 'menu.btn.system.role.edit', 2, NULL, NULL, 'system:role:edit', NULL, 2, 0, 1, 1, 1, 'ZH: 角色修改按钮 - FR: Bouton Modifier le rôle - EN: Edit Role button', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);
INSERT INTO `sys_menu` VALUES (23, 3, 'menu.btn.system.role.delete', 2, NULL, NULL, 'system:role:delete', NULL, 3, 0, 1, 1, 1, 'ZH: 角色删除按钮 - FR: Bouton Supprimer le rôle - EN: Delete Role button', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);
INSERT INTO `sys_menu` VALUES (24, 3, 'menu.btn.system.role.auth', 2, NULL, NULL, 'system:role:auth', NULL, 4, 0, 1, 1, 1, 'ZH: 分配权限按钮 - FR: Bouton Attribuer des permissions - EN: Assign Permissions button', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);

-- 菜单管理 / Gestion des menus / Menu Management 4
INSERT INTO `sys_menu` VALUES (4, 1, 'menu.page.system.menu', 1, '/system/menu', 'system/menu/MenuPage.vue', 'system:menu:list', 'menu', 3, 0, 1, 1, 1, 'ZH: 菜单管理菜单 - FR: Menu de gestion des menus - EN: Menu Management Menu', 0, '2025-08-17 15:42:01', '2025-09-25 08:48:55', 1, 1);
INSERT INTO `sys_menu` VALUES (31, 4, 'menu.btn.system.menu.add', 2, NULL, NULL, 'system:menu:add', NULL, 1, 0, 1, 1, 1, 'ZH: 菜单新增按钮 - FR: Bouton Ajouter un menu - EN: Add Menu button', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);
INSERT INTO `sys_menu` VALUES (32, 4, 'menu.btn.system.menu.edit', 2, NULL, NULL, 'system:menu:edit', NULL, 2, 0, 1, 1, 1, 'ZH: 菜单修改按钮 - FR: Bouton Modifier le menu - EN: Edit Menu button', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);
INSERT INTO `sys_menu` VALUES (33, 4, 'menu.btn.system.menu.delete', 2, NULL, NULL, 'system:menu:delete', NULL, 3, 0, 1, 1, 1, 'ZH: 菜单删除按钮 - FR: Bouton Supprimer le menu - EN: Delete Menu button', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);

-- 日志管理 / Gestion des journaux / Log Management 1
INSERT INTO `sys_menu` VALUES (5, 1, 'menu.page.system.log', 1, '/system/log', 'system/log', 'system:log:list', 'description', 4, 0, 1, 1, 1, 'ZH: 日志管理菜单 - FR: Menu de gestion des journaux - EN: Log Management Menu', 0, '2025-08-17 15:42:01', '2025-09-01 16:48:22', 1, 1);

-- 字典管理 / Gestion des dictionnaires / Dictionary Management 4
INSERT INTO `sys_menu` VALUES (40, 1, 'menu.page.system.dict', 1, '/system/dict', 'system/dict', 'system:dict:list', 'article', 4, 0, 1, 1, 1, 'ZH: 字典管理菜单 - FR: Menu de gestion des dictionnaires - EN: Dictionary Management Menu', 0, '2025-08-17 15:42:01', '2025-09-12 10:22:02', 1, 1);
INSERT INTO `sys_menu` VALUES (1006, 40, 'menu.btn.system.dict.add', 2, NULL, NULL, 'system:dict:add', NULL, 1, 0, 1, 1, 1, 'ZH: 添加字典按钮 - FR: Bouton Ajouter un dictionnaire - EN: Add Dictionary button', 0, '2025-09-11 17:54:05', '2025-09-12 10:54:20', 1, 1);
INSERT INTO `sys_menu` VALUES (1007, 40, 'menu.btn.system.dict.edit', 2, NULL, NULL, 'system:dict:edit', NULL, 2, 0, 1, 1, 1, 'ZH: 字典修改按钮 - FR: Bouton Modifier le dictionnaire - EN: Edit Dictionary button', 0, '2025-09-12 10:55:38', '2025-09-12 10:55:59', 1, 1);
INSERT INTO `sys_menu` VALUES (1028, 40, 'menu.btn.system.dict.delete', 2, NULL, NULL, 'system:dict:delete', NULL, 3, 0, 1, 1, 1, 'ZH: 字典删除按钮 - FR: Bouton Supprimer le dictionnaire - EN: Delete Dictionary button', 0, '2025-09-28 10:46:01', '2025-09-28 10:46:01', 1, 1);

-- 部门管理 / Gestion des départements / Department Management 5
INSERT INTO `sys_menu` VALUES (1001, 1, 'menu.page.system.dept', 1, '/system/dept', 'system/dept', 'system:dept:list', 'account_tree', 2, 0, 1, 1, 1, 'ZH: 部门管理菜单 - FR: Menu de gestion des départements - EN: Department Management Menu', 0, '2025-09-07 17:57:57', '2025-09-21 16:21:35', 1, 1);
INSERT INTO `sys_menu` VALUES (1002, 1001, 'menu.btn.system.dept.query', 2, '', '', 'system:dept:query', '', 1, 0, 1, 1, 1, 'ZH: 部门查询按钮 - FR: Bouton Rechercher un département - EN: Query Department button', 0, '2025-09-07 17:58:04', '2025-09-07 17:58:04', NULL, NULL);
INSERT INTO `sys_menu` VALUES (1003, 1001, 'menu.btn.system.dept.add', 2, '', '', 'system:dept:add', '', 2, 0, 1, 1, 1, 'ZH: 部门新增按钮 - FR: Bouton Ajouter un département - EN: Add Department button', 0, '2025-09-07 17:58:04', '2025-09-07 17:58:04', NULL, NULL);
INSERT INTO `sys_menu` VALUES (1004, 1001, 'menu.btn.system.dept.edit', 2, '', '', 'system:dept:edit', '', 3, 0, 1, 1, 1, 'ZH: 部门修改按钮 - FR: Bouton Modifier le département - EN: Edit Department button', 0, '2025-09-07 17:58:04', '2025-09-07 17:58:04', NULL, NULL);
INSERT INTO `sys_menu` VALUES (1005, 1001, 'menu.btn.system.dept.remove', 2, '', '', 'system:dept:remove', '', 4, 0, 1, 1, 1, 'ZH: 部门删除按钮 - FR: Bouton Supprimer le département - EN: Delete Department button', 0, '2025-09-07 17:58:04', '2025-09-07 17:58:04', NULL, NULL);

-- 代码生成 / Générateur de code / Code Generator 5
INSERT INTO `sys_menu` VALUES (1013, 1, 'menu.page.system.generator', 1, '/system/generator', 'system/generator', 'generator:table:list', 'code', 6, 0, 1, 1, 1, 'ZH: 代码生成管理菜单 - FR: Menu de gestion de la génération de code - EN: Code Generation Management Menu', 0, '2025-09-24 09:43:29', '2025-09-24 09:43:29', 1, 1);
INSERT INTO `sys_menu` VALUES (1014, 1013, 'menu.btn.generator.table.info', 2, '', '', 'generator:table:info', 'visibility', 1, 0, 1, 1, 1, 'ZH: 查看数据库表信息按钮 - FR: Bouton Voir les informations de table - EN: View Table Info button', 0, '2025-09-24 09:43:42', '2025-09-24 09:48:06', 1, 1);
INSERT INTO `sys_menu` VALUES (1015, 1013, 'menu.btn.generator.code.preview', 2, '', '', 'generator:code:preview', 'preview', 2, 0, 1, 1, 1, 'ZH: 预览生成代码按钮 - FR: Bouton Aperçu du code généré - EN: Preview Generated Code button', 0, '2025-09-24 09:43:42', '2025-09-24 09:48:08', 1, 1);
INSERT INTO `sys_menu` VALUES (1016, 1013, 'menu.btn.generator.code.generate', 2, '', '', 'generator:code:generate', 'download', 3, 0, 1, 1, 1, 'ZH: 生成代码按钮 - FR: Bouton Générer le code - EN: Generate Code button', 0, '2025-09-24 09:43:42', '2025-09-24 09:48:09', 1, 1);
INSERT INTO `sys_menu` VALUES (1017, 1013, 'menu.btn.generator.code.download', 2, '', '', 'generator:code:download', 'file_download', 4, 0, 1, 1, 1, 'ZH: 下载代码按钮 - FR: Bouton Télécharger le code - EN: Download Code button', 0, '2025-09-24 09:43:42', '2025-09-24 09:48:13', 1, 1);

-- 系统监控 / Supervision du système / System Monitoring 4
INSERT INTO `sys_menu` VALUES (36, 0, 'menu.dir.monitor', 0, '/monitor', NULL, 'monitor:manage', 'monitor', 2, 0, 1, 1, 1, 'ZH: 系统监控目录 - FR: Répertoire de supervision du système - EN: System Monitoring Directory', 0, '2025-09-02 17:17:30', '2025-09-02 17:17:30', 1, 1);
INSERT INTO `sys_menu` VALUES (37, 36, 'menu.page.monitor.online', 1, '/monitor/online', 'monitor/online', 'monitor:online:list', 'people_outline', 1, 0, 1, 1, 1, 'ZH: 在线用户菜单 - FR: Menu des utilisateurs en ligne - EN: Online Users Menu', 0, '2025-09-02 17:17:30', '2025-09-02 17:36:15', 1, 1);
INSERT INTO `sys_menu` VALUES (38, 37, 'menu.btn.monitor.online.forceLogout', 2, NULL, NULL, 'monitor:online:forceLogout', NULL, 1, 0, 1, 1, 1, 'ZH: 强制下线按钮 - FR: Bouton Forcer la déconnexion - EN: Force Logout button', 0, '2025-09-02 17:17:30', '2025-09-02 17:23:08', 1, 1);
INSERT INTO `sys_menu` VALUES (39, 37, 'menu.btn.monitor.online.clean', 2, NULL, NULL, 'monitor:online:clean', NULL, 2, 0, 1, 1, 1, 'ZH: 清理过期按钮 - FR: Bouton Nettoyer les expirés - EN: Clean Expired button', 0, '2025-09-02 17:17:30', '2025-09-02 17:23:11', 1, 1);

-- 测试目录 / Répertoire de test / Test Directory 7
INSERT INTO `sys_menu` VALUES (6, 0, 'menu.dir.test', 0, '/test', NULL, 'test:enterprise', 'home', 10, 0, 1, 1, 1, 'ZH: 测试目录 - FR: Répertoire de test - EN: Test Directory', 0, '2025-08-21 17:18:55', '2025-09-30 08:51:19', NULL, 1);
INSERT INTO `sys_menu` VALUES (1021, 6, 'menu.page.test.enterprise', 1, '/test/enterprise', 'test/enterprise', 'test:enterprise:list', NULL, 10, 0, 1, 1, 1, 'ZH: 测试企业管理菜单 - FR: Menu de gestion des entreprises de test - EN: Test Enterprise Management Menu', 0, '2025-09-25 17:22:03', '2025-09-28 10:43:51', 1, 1);
INSERT INTO `sys_menu` VALUES (1022, 1021, 'menu.btn.test.enterprise.query', 2, '', '', 'test:enterprise:query', 'search', 1, 0, 1, 1, 1, 'ZH: 测试企业查询按钮 - FR: Bouton Rechercher une entreprise de test - EN: Query Test Enterprise button', 0, '2025-09-25 17:22:03', '2025-09-25 17:22:03', 1, 1);
INSERT INTO `sys_menu` VALUES (1023, 1021, 'menu.btn.test.enterprise.add', 2, '', '', 'test:enterprise:add', 'add', 2, 0, 1, 1, 1, 'ZH: 测试企业新增按钮 - FR: Bouton Ajouter une entreprise de test - EN: Add Test Enterprise button', 0, '2025-09-25 17:22:03', '2025-09-25 17:22:03', 1, 1);
INSERT INTO `sys_menu` VALUES (1024, 1021, 'menu.btn.test.enterprise.edit', 2, '', '', 'test:enterprise:edit', 'edit', 3, 0, 1, 1, 1, 'ZH: 测试企业修改按钮 - FR: Bouton Modifier l’entreprise de test - EN: Edit Test Enterprise button', 0, '2025-09-25 17:22:03', '2025-09-25 17:22:03', 1, 1);
INSERT INTO `sys_menu` VALUES (1025, 1021, 'menu.btn.test.enterprise.remove', 2, '', '', 'test:enterprise:remove', 'delete', 4, 0, 1, 1, 1, 'ZH: 测试企业删除按钮 - FR: Bouton Supprimer l’entreprise de test - EN: Delete Test Enterprise button', 0, '2025-09-25 17:22:03', '2025-09-25 17:22:03', 1, 1);
INSERT INTO `sys_menu` VALUES (1026, 1021, 'menu.btn.test.enterprise.export', 2, '', '', 'test:enterprise:export', 'file_download', 5, 0, 1, 1, 1, 'ZH: 测试企业导出按钮 - FR: Bouton Exporter les entreprises de test - EN: Export Test Enterprises button', 0, '2025-09-25 17:22:03', '2025-09-25 17:22:03', 1, 1);


-- ----------------------------
-- Records of sys_role
-- ----------------------------

INSERT INTO `sys_role` VALUES (1, 'Administrateur système', 'admin', 'Administrateur avec tous les droits', 1, 1, 1, 'ZH: 超级管理员角色 - FR: Rôle Administrateur système - EN: System Administrator Role', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);
INSERT INTO `sys_role` VALUES (2, 'Utilisateur standard', 'user', 'Utilisateur avec des autorisations de base', 4, 2, 1, 'ZH: 普通用户角色 - FR: Rôle Utilisateur standard - EN: Standard User Role', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);
-- Rôles système étendus
INSERT INTO `sys_role` VALUES (3, 'Gestionnaire', 'manager', 'Responsable de module ou d’équipe avec autorisations avancées', 2, 3, 1, 'ZH: 管理者角色 - FR: Rôle Gestionnaire / Manager - EN: Manager Role', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);
INSERT INTO `sys_role` VALUES (4, 'Auditeur', 'auditor', 'Consultation des données et rapports sans possibilité de modification', 3, 4, 1, 'ZH: 审计员角色 - FR: Rôle Auditeur - EN: Auditor Role', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);
INSERT INTO `sys_role` VALUES (5, 'Formateur', 'trainer', 'Accès aux cours, modules et gestion de la progression des apprenants', 3, 5, 1, 'ZH: 培训师角色 - FR: Rôle Formateur - EN: Trainer Role', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);
INSERT INTO `sys_role` VALUES (6, 'Superviseur RH', 'hr_supervisor', 'Gestion des employés, recrutement et suivi des compétences', 3, 6, 1, 'ZH: 人力资源主管角色 - FR: Rôle Superviseur RH - EN: HR Supervisor Role', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);
INSERT INTO `sys_role` VALUES (7, 'Formateur externe', 'external_trainer', 'Intervenant externe habilité à animer des formations sans accès administratif', 3, 7, 1, 'ZH: 外部培训师角色 - FR: Rôle Formateur externe - EN: External Trainer Role', 0, '2025-08-17 15:42:01', '2025-08-17 15:42:01', 1, 1);

-- ----------------------------
-- Records of sys_role_dept
-- ----------------------------

INSERT INTO `sys_role_dept` VALUES (2, 3);

-- ----------------------------
-- Records of sys_role_menu
-- ----------------------------

INSERT INTO `sys_role_menu` VALUES (384, 1, 1, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (385, 1, 2, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (386, 1, 3, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (387, 1, 4, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (388, 1, 5, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (389, 1, 11, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (390, 1, 12, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (391, 1, 13, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (392, 1, 14, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (393, 1, 15, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (394, 1, 21, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (395, 1, 22, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (396, 1, 23, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (397, 1, 24, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (398, 1, 31, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (399, 1, 32, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (400, 1, 33, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (401, 1, 36, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (402, 1, 37, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (403, 1, 38, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (404, 1, 39, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (405, 1, 40, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (406, 1, 1001, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (407, 1, 1002, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (408, 1, 1003, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (409, 1, 1004, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (410, 1, 1005, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (411, 1, 1006, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (412, 1, 1007, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (413, 1, 1013, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (414, 1, 1014, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (415, 1, 1015, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (416, 1, 1016, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (417, 1, 1017, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (418, 1, 1028, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (419, 1, 6, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (420, 1, 1021, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (421, 1, 1022, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (422, 1, 1023, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (423, 1, 1024, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (424, 1, 1025, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (425, 1, 1026, '2025-09-30 08:52:15', 1);
INSERT INTO `sys_role_menu` VALUES (451, 2, 1, '2025-09-30 08:52:58', 1);
INSERT INTO `sys_role_menu` VALUES (452, 2, 5, '2025-09-30 08:52:58', 1);
INSERT INTO `sys_role_menu` VALUES (453, 2, 36, '2025-09-30 08:52:58', 1);
INSERT INTO `sys_role_menu` VALUES (454, 2, 37, '2025-09-30 08:52:58', 1);
INSERT INTO `sys_role_menu` VALUES (455, 2, 38, '2025-09-30 08:52:58', 1);
INSERT INTO `sys_role_menu` VALUES (456, 2, 39, '2025-09-30 08:52:58', 1);
INSERT INTO `sys_role_menu` VALUES (457, 2, 40, '2025-09-30 08:52:58', 1);
INSERT INTO `sys_role_menu` VALUES (458, 2, 1006, '2025-09-30 08:52:58', 1);
INSERT INTO `sys_role_menu` VALUES (459, 2, 1007, '2025-09-30 08:52:58', 1);
INSERT INTO `sys_role_menu` VALUES (460, 2, 6, '2025-09-30 08:52:58', 1);
INSERT INTO `sys_role_menu` VALUES (461, 2, 1021, '2025-09-30 08:52:58', 1);
INSERT INTO `sys_role_menu` VALUES (462, 2, 1022, '2025-09-30 08:52:58', 1);
INSERT INTO `sys_role_menu` VALUES (463, 2, 1023, '2025-09-30 08:52:58', 1);
INSERT INTO `sys_role_menu` VALUES (464, 2, 1024, '2025-09-30 08:52:58', 1);
INSERT INTO `sys_role_menu` VALUES (465, 2, 1025, '2025-09-30 08:52:58', 1);
INSERT INTO `sys_role_menu` VALUES (466, 2, 1026, '2025-09-30 08:52:58', 1);

-- ----------------------------
-- Records of sys_user
-- ----------------------------

INSERT INTO `sys_user` VALUES (1, 'admin', '$2a$10$XD5cbPL1xiqH.DRXWMBaQuIMAS5Xb/NZBOQsHilEhIWhRkCeWvYda', '超级管理员', 'admin@ywhc.com', '13800138000', NULL, 1, 1, '2025-09-30 08:48:30', '127.0.0.1', 2, '系统管理员账号', 0, '2025-08-17 15:42:01', '2025-09-30 08:48:30', 1, 1);
INSERT INTO `sys_user` VALUES (2, 'user', '$2a$10$4FeS6DHswpVQ9m08zXSTHOKjJs8CupuK.Zgkp98XobdrQMPZlEOgK', '普通用户', 'user@ywhc.com', '13800138001', NULL, 1, 1, '2025-09-30 08:50:31', '0:0:0:0:0:0:0:1', 3, '普通用户账号', 0, '2025-08-17 15:42:01', '2025-09-30 08:50:31', 1, 1);

-- ----------------------------
-- Records of sys_user_role
-- ----------------------------
INSERT INTO `sys_user_role` VALUES (2, 2, 2, '2025-08-17 15:42:01', 1);
INSERT INTO `sys_user_role` VALUES (5, 1, 1, '2025-09-20 17:37:22', 1);

-- ----------------------------
-- Records of sys_i18n (version complète avec source + timestamp + context)
-- ----------------------------

-- 系统管理 / Gestion du système / System Management
INSERT INTO `sys_i18n` VALUES ('menu.dir.system','zh-CN','系统管理','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.dir.system','fr-FR','Gestion du système','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.dir.system','en-US','System Management','system','ai',NOW());

-- 用户管理 / Gestion des utilisateurs / User Management
INSERT INTO `sys_i18n` VALUES ('menu.page.system.user','zh-CN','用户管理','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.system.user','fr-FR','Gestion des utilisateurs','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.system.user','en-US','User Management','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.user.add','zh-CN','用户新增','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.user.add','fr-FR','Ajouter un utilisateur','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.user.add','en-US','Add User','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.user.edit','zh-CN','用户修改','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.user.edit','fr-FR','Modifier l’utilisateur','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.user.edit','en-US','Edit User','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.user.delete','zh-CN','用户删除','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.user.delete','fr-FR','Supprimer l’utilisateur','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.user.delete','en-US','Delete User','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.user.export','zh-CN','用户导出','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.user.export','fr-FR','Exporter les utilisateurs','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.user.export','en-US','Export Users','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.user.resetPwd','zh-CN','重置密码','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.user.resetPwd','fr-FR','Réinitialiser le mot de passe','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.user.resetPwd','en-US','Reset Password','system','ai',NOW());

-- 角色管理 / Gestion des rôles / Role Management
INSERT INTO `sys_i18n` VALUES ('menu.page.system.role','zh-CN','角色管理','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.system.role','fr-FR','Gestion des rôles','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.system.role','en-US','Role Management','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.role.add','zh-CN','角色新增','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.role.add','fr-FR','Ajouter un rôle','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.role.add','en-US','Add Role','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.role.edit','zh-CN','角色修改','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.role.edit','fr-FR','Modifier le rôle','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.role.edit','en-US','Edit Role','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.role.delete','zh-CN','角色删除','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.role.delete','fr-FR','Supprimer le rôle','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.role.delete','en-US','Delete Role','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.role.auth','zh-CN','分配权限','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.role.auth','fr-FR','Attribuer des permissions','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.role.auth','en-US','Assign Permissions','system','ai',NOW());

-- 菜单管理 / Menu Management
INSERT INTO `sys_i18n` VALUES ('menu.page.system.menu','zh-CN','菜单管理','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.system.menu','fr-FR','Gestion des menus','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.system.menu','en-US','Menu Management','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.menu.add','zh-CN','菜单新增','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.menu.add','fr-FR','Ajouter un menu','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.menu.add','en-US','Add Menu','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.menu.edit','zh-CN','菜单修改','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.menu.edit','fr-FR','Modifier le menu','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.menu.edit','en-US','Edit Menu','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.menu.delete','zh-CN','菜单删除','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.menu.delete','fr-FR','Supprimer le menu','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.menu.delete','en-US','Delete Menu','system','ai',NOW());

-- 系统监控 / System Monitoring
INSERT INTO `sys_i18n` VALUES ('menu.dir.monitor','zh-CN','系统监控','monitor','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.dir.monitor','fr-FR','Supervision du système','monitor','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.dir.monitor','en-US','System Monitoring','monitor','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.page.monitor.online','zh-CN','在线用户','monitor','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.monitor.online','fr-FR','Utilisateurs en ligne','monitor','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.monitor.online','en-US','Online Users','monitor','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.monitor.online.forceLogout','zh-CN','强制下线','monitor','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.monitor.online.forceLogout','fr-FR','Forcer la déconnexion','monitor','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.monitor.online.forceLogout','en-US','Force Logout','monitor','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.monitor.online.clean','zh-CN','清理过期','monitor','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.monitor.online.clean','fr-FR','Nettoyer les expirés','monitor','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.monitor.online.clean','en-US','Clean Expired','monitor','ai',NOW());

-- 测试模块 / Test Directory
INSERT INTO `sys_i18n` VALUES ('menu.dir.test','zh-CN','测试目录','test','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.dir.test','fr-FR','Répertoire de test','test','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.dir.test','en-US','Test Directory','test','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.page.test.enterprise','zh-CN','测试企业管理','test','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.test.enterprise','fr-FR','Gestion des entreprises de test','test','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.test.enterprise','en-US','Test Enterprise Management','test','ai',NOW());

-- 字典管理 / Dictionary Management
INSERT INTO `sys_i18n` VALUES ('menu.page.system.dict','zh-CN','字典管理','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.system.dict','fr-FR','Gestion des dictionnaires','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.system.dict','en-US','Dictionary Management','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dict.add','zh-CN','添加字典','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dict.add','fr-FR','Ajouter un dictionnaire','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dict.add','en-US','Add Dictionary','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dict.edit','zh-CN','字典修改','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dict.edit','fr-FR','Modifier le dictionnaire','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dict.edit','en-US','Edit Dictionary','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dict.delete','zh-CN','字典删除','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dict.delete','fr-FR','Supprimer le dictionnaire','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dict.delete','en-US','Delete Dictionary','system','ai',NOW());

-- 部门管理 / Department Management
INSERT INTO `sys_i18n` VALUES ('menu.page.system.dept','zh-CN','部门管理','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.system.dept','fr-FR','Gestion des départements','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.system.dept','en-US','Department Management','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dept.query','zh-CN','部门查询','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dept.query','fr-FR','Rechercher un département','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dept.query','en-US','Query Department','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dept.add','zh-CN','部门新增','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dept.add','fr-FR','Ajouter un département','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dept.add','en-US','Add Department','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dept.edit','zh-CN','部门修改','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dept.edit','fr-FR','Modifier le département','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dept.edit','en-US','Edit Department','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dept.remove','zh-CN','部门删除','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dept.remove','fr-FR','Supprimer le département','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.system.dept.remove','en-US','Delete Department','system','ai',NOW());

-- 代码生成 / Code Generator
INSERT INTO `sys_i18n` VALUES ('menu.page.system.generator','zh-CN','代码生成','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.system.generator','fr-FR','Générateur de code','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.page.system.generator','en-US','Code Generator','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.generator.table.info','zh-CN','查看表信息','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.generator.table.info','fr-FR','Voir les informations de table','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.generator.table.info','en-US','View Table Info','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.generator.code.preview','zh-CN','预览代码','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.generator.code.preview','fr-FR','Aperçu du code généré','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.generator.code.preview','en-US','Preview Generated Code','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.generator.code.generate','zh-CN','生成代码','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.generator.code.generate','fr-FR','Générer le code','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.generator.code.generate','en-US','Generate Code','system','ai',NOW());

INSERT INTO `sys_i18n` VALUES ('menu.btn.generator.code.download','zh-CN','下载代码','system','mysql_dump',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.generator.code.download','fr-FR','Télécharger le code','system','ai',NOW());
INSERT INTO `sys_i18n` VALUES ('menu.btn.generator.code.download','en-US','Download Code','system','ai',NOW());

-- ----------------------------
-- Records of sys_i18n (for sys_dict_type)
-- ----------------------------

-- request_methods
INSERT INTO `sys_i18n` VALUES ('dict.type.request_methods', 'zh-CN', '请求方法', 'dict_type', 'mysql_dump', NOW());
INSERT INTO `sys_i18n` VALUES ('dict.type.request_methods', 'fr-FR', 'Méthodes de requête', 'dict_type', 'ai', NOW());
INSERT INTO `sys_i18n` VALUES ('dict.type.request_methods', 'en-US', 'Request Methods', 'dict_type', 'ai', NOW());

-- sys_oper_type
INSERT INTO `sys_i18n` VALUES ('dict.type.sys_oper_type', 'zh-CN', '操作类型', 'dict_type', 'mysql_dump', NOW());
INSERT INTO `sys_i18n` VALUES ('dict.type.sys_oper_type', 'fr-FR', 'Types d’opérations', 'dict_type', 'ai', NOW());
INSERT INTO `sys_i18n` VALUES ('dict.type.sys_oper_type', 'en-US', 'Operation Types', 'dict_type', 'ai', NOW());

-- response_status
INSERT INTO `sys_i18n` VALUES ('dict.type.response_status', 'zh-CN', '响应状态', 'dict_type', 'mysql_dump', NOW());
INSERT INTO `sys_i18n` VALUES ('dict.type.response_status', 'fr-FR', 'Statuts de réponse', 'dict_type', 'ai', NOW());
INSERT INTO `sys_i18n` VALUES ('dict.type.response_status', 'en-US', 'Response Status', 'dict_type', 'ai', NOW());

-- enterprise_status
INSERT INTO `sys_i18n` VALUES ('dict.type.enterprise_status', 'zh-CN', '企业状态', 'dict_type', 'mysql_dump', NOW());
INSERT INTO `sys_i18n` VALUES ('dict.type.enterprise_status', 'fr-FR', 'Statuts d’entreprise', 'dict_type', 'ai', NOW());
INSERT INTO `sys_i18n` VALUES ('dict.type.enterprise_status', 'en-US', 'Enterprise Status', 'dict_type', 'ai', NOW());
