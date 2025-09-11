import { menuApi } from "src/api";
import { LocalStorage } from "quasar";

/**
 * 组件映射表 - 支持动态注册和静态预定义
 *
 * 为什么需要组件映射表：
 * 1. Vite/Webpack 需要在编译时进行静态分析
 * 2. 动态 import() 必须包含足够的路径信息供打包工具识别
 * 3. 确保组件能够正确地进行代码分割和懒加载
 *
 * 使用方式：
 * - 预定义常用组件路径
 * - 支持运行时动态注册新组件
 * - 提供组件路径规范化和映射功能
 */
// 使用Vite的import.meta.glob预加载所有页面组件
const modules = import.meta.glob("../pages/**/*.vue");

console.log("🗂️ Vite预加载的组件模块:", Object.keys(modules));

const componentMap = new Map();

// 组件映射初始化状态
let componentMappingLoaded = false;

/**
 * 规范化组件路径
 * 支持多种路径格式的转换
 */
const normalizeComponentPath = (componentPath) => {
  if (!componentPath) return [];

  // 移除开头的斜杠和 pages/ 前缀
  let normalized = componentPath.replace(/^\/+/, "").replace(/^pages?\//, "");

  // 移除结尾的 .vue 扩展名
  normalized = normalized.replace(/\.vue$/, "");

  // 支持不同的路径格式变体
  const pathVariants = [
    normalized, // 原始路径: system/user
    `pages/${normalized}`, // 添加pages前缀: pages/system/user
    `pages/${normalized}Page`, // 页面组件格式: pages/system/userPage
    normalized + "/index", // 添加 /index
    normalized.replace(/\/index$/, ""), // 移除 /index
  ];

  // 特殊处理: 如果路径不包含页面组件名，尝试构建标准页面路径
  if (!normalized.includes('Page')) {
    const pathParts = normalized.split("/");
    const moduleName = pathParts[pathParts.length - 1];
    if (moduleName) {
      const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
      pathVariants.push(`${normalized}/${capitalizedModule}Page`);
      pathVariants.push(`pages/${normalized}/${capitalizedModule}Page`);
    }
  }

  return pathVariants;
};

/**
 * 获取组件 - 支持多种路径格式和动态加载
 */
const getComponent = (componentPath) => {
  if (!componentPath) return null;

  // 首先尝试直接匹配
  if (componentMap.has(componentPath)) {
    console.log(`✅ 组件映射成功: ${componentPath}`);
    return componentMap.get(componentPath);
  }

  // 尝试规范化路径的各种变体
  const pathVariants = normalizeComponentPath(componentPath);

  for (const variant of pathVariants) {
    if (componentMap.has(variant)) {
      console.log(`✅ 组件映射成功: ${componentPath} -> ${variant}`);
      return componentMap.get(variant);
    }
  }

  // 暂时禁用动态组件生成，专注于API返回的映射
  // const dynamicComponent = generateDynamicComponent(componentPath);
  // if (dynamicComponent) {
  //   // 注册动态生成的组件
  //   componentMap.set(componentPath, dynamicComponent);
  //   console.log(`✅ 动态组件生成成功: ${componentPath}`);
  //   return dynamicComponent;
  // }

  console.warn(
    `⚠️ 未找到组件映射: ${componentPath}，可能的路径变体:`,
    pathVariants
  );
  return null;
};

// 动态生成组件函数已移除，现在使用 import.meta.glob 方式

/**
 * 生成路由名称
 */
const generateRouteName = (path) => {
  if (!path) return "";

  return path
    .replace(/^\/+/, "")
    .replace(/\/+/g, "-")
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
};

/**
 * 转换单个菜单为路由
 */
const transformMenuToRoute = (menu) => {
  // 跳过按钮类型、隐藏或禁用的菜单
  if (menu.menuType === 2 || menu.isVisible === 0 || menu.status === 0) {
    return null;
  }

  // 跳过没有路径的菜单
  if (!menu.path) {
    return null;
  }

  console.log(
    `🔄 处理菜单: ${menu.menuName}, 路径: ${menu.path}, 类型: ${menu.menuType}, 组件: ${menu.component}`
  );

  // 创建路由配置
  const route = {
    path: menu.path.startsWith("/") ? menu.path.substring(1) : menu.path, // 移除开头斜杠作为子路由
    name: generateRouteName(menu.path),
    meta: {
      title: menu.menuName,
      icon: menu.icon,
      permission: menu.permission,
      keepAlive: menu.isCache === 1,
      hidden: menu.isVisible === 0,
    },
  };

  // 处理组件 - 只有菜单类型才需要组件
  if (menu.menuType === 1 && menu.component) {
    const component = getComponent(menu.component);
    if (component) {
      route.component = component;
    } else {
      console.warn(`❌ 组件加载失败，跳过菜单: ${menu.menuName}`);
      return null;
    }
  }

  // 处理子菜单
  if (menu.children && menu.children.length > 0) {
    const children = [];

    menu.children.forEach((childMenu) => {
      // 跳过按钮类型
      if (
        childMenu.menuType === 2 ||
        childMenu.isVisible === 0 ||
        childMenu.status === 0
      ) {
        return;
      }

      if (!childMenu.path) {
        return;
      }

      // 计算子路由的相对路径
      let childPath;

      // 规范化路径 - 移除开头的斜杠
      const normalizedParentPath = menu.path.startsWith("/")
        ? menu.path.substring(1)
        : menu.path;
      const normalizedChildPath = childMenu.path.startsWith("/")
        ? childMenu.path.substring(1)
        : childMenu.path;

      if (normalizedChildPath.startsWith(normalizedParentPath + "/")) {
        childPath = normalizedChildPath.substring(
          normalizedParentPath.length + 1
        );
      } else {
        // 提取最后一段作为子路径
        const segments = normalizedChildPath.split("/").filter(Boolean);
        childPath = segments[segments.length - 1];
      }

      // 确保子路径不为空且格式正确
      if (!childPath || childPath.trim() === "") {
        console.warn(`⚠️ 跳过无效子路径: ${childMenu.path}`);
        return;
      }

      const childRoute = {
        path: childPath,
        name: generateRouteName(childMenu.path),
        meta: {
          title: childMenu.menuName,
          icon: childMenu.icon,
          permission: childMenu.permission,
          keepAlive: childMenu.isCache === 1,
          hidden: childMenu.isVisible === 0,
        },
      };

      // 子菜单组件
      if (childMenu.menuType === 1 && childMenu.component) {
        const childComponent = getComponent(childMenu.component);
        if (childComponent) {
          childRoute.component = childComponent;
          children.push(childRoute);
          console.log(`✅ 子路由创建: ${childMenu.path} -> ${childPath}`);
        }
      }
    });

    if (children.length > 0) {
      route.children = children;

      // 如果是目录类型，设置重定向
      if (menu.menuType === 0) {
        const firstChild = children[0];
        if (firstChild) {
          // 重定向路径应该是相对于当前路由的子路径
          route.redirect = firstChild.path;
          console.log(`🔀 目录重定向: ${route.path} -> ${firstChild.path}`);
        }
      }
    }
  }

  return route;
};

/**
 * 获取用户动态路由
 */
export const getUserRoutes = async (usePersistedMenus = false) => {
  try {
    let menuData = [];

    if (usePersistedMenus) {
      // 尝试使用持久化的菜单数据
      const persistedMenus = LocalStorage.getItem("userMenus");
      if (persistedMenus && persistedMenus.length > 0) {
        console.log("📋 使用持久化菜单数据:", persistedMenus);
        menuData = persistedMenus;
      } else {
        console.log("📋 没有持久化菜单数据，从API获取...");
        const response = await menuApi.getUserMenus();
        if (response.data && response.data.code === 200) {
          menuData = response.data.data || [];
        }
      }
    } else {
      console.log("🔄 从API获取用户菜单数据...");
      const response = await menuApi.getUserMenus();
      if (response.data && response.data.code === 200) {
        menuData = response.data.data || [];
      }
    }

    // 确保组件映射已加载
    if (!componentMappingLoaded) {
      console.log("📦 组件映射未加载，正在加载...");
      await loadComponentMappingFromAPI();
    }

    console.log("📋 菜单数据:", menuData);

    const routes = [];

    menuData.forEach((menu) => {
      const route = transformMenuToRoute(menu);
      if (route) {
        routes.push(route);
      }
    });

    console.log("✅ 动态路由生成完成:", routes);
    return routes;
  } catch (error) {
    console.error("❌ 获取用户路由失败:", error);
    return [];
  }
};

/**
 * 添加动态路由
 */
export const addDynamicRoutes = (router, routes) => {
  if (!routes || routes.length === 0) {
    console.log("📝 没有动态路由需要添加");
    return;
  }

  console.log("🚀 开始添加动态路由...");

  let successCount = 0;

  routes.forEach((route) => {
    try {
      console.log(`➕ 添加路由: ${route.path}`, {
        name: route.name,
        component: !!route.component,
        children: route.children?.length || 0,
        redirect: route.redirect,
      });

      // 如果路径为空或无效，跳过此路由
      if (!route.path || route.path.trim() === "") {
        console.warn(`⚠️ 跳过无效路由路径: ${route.path}`);
        return;
      }

      // 添加到主布局下 - 使用路由名称而不是路径
      router.addRoute("MainLayout", route);

      successCount++;
      console.log(`✅ 路由添加成功: ${route.path}`);
    } catch (error) {
      console.error(`❌ 路由添加失败: ${route.path}`, error);
    }
  });

  console.log(`📊 路由添加完成，成功: ${successCount}/${routes.length}`);

  // 输出所有路由用于调试
  const allRoutes = router.getRoutes();
  console.log("📜 当前所有路由数量:", allRoutes.length);
};

/**
 * 初始化动态路由
 */
export const initDynamicRoutes = async (router, usePersistedMenus = true) => {
  try {
    console.log("🔧 初始化动态路由系统...");

    const routes = await getUserRoutes(usePersistedMenus);

    if (routes.length === 0) {
      console.log("📋 没有动态路由数据");
      return true;
    }

    addDynamicRoutes(router, routes);

    console.log("🎉 动态路由初始化完成!");
    return true;
  } catch (error) {
    console.error("❌ 动态路由初始化失败:", error);
    return false;
  }
};

/**
 * 重置动态路由
 */
export const resetDynamicRoutes = (router) => {
  try {
    console.log("🧹 清理动态路由...");

    const allRoutes = router.getRoutes();
    const baseRoutes = [
      "/",
      "/login",
      "/404",
      "/:catchAll(.*)*",
      "/dashboard",
      "/profile",
    ];
    const baseNames = ["Dashboard", "Profile", "MainLayout"];

    let removedCount = 0;

    allRoutes.forEach((route) => {
      if (
        route.name &&
        !baseNames.includes(route.name) &&
        !baseRoutes.includes(route.path)
      ) {
        try {
          router.removeRoute(route.name);
          console.log(`🗑️ 移除路由: ${route.name}`);
          removedCount++;
        } catch (error) {
          console.warn(`⚠️ 移除路由失败: ${route.name}`, error);
        }
      }
    });

    console.log(`✅ 动态路由清理完成，移除 ${removedCount} 个路由`);
  } catch (error) {
    console.error("❌ 动态路由重置失败:", error);
  }
};

/**
 * 注册新组件到映射表
 * 支持批量注册和单个注册
 */
export const registerComponent = (path, component) => {
  if (!path || !component) {
    console.warn("⚠️ 注册组件失败：参数无效");
    return false;
  }

  componentMap.set(path, component);
  console.log(`✅ 组件注册成功: ${path}`);
  return true;
};

/**
 * 批量注册组件
 */
export const registerComponents = (components) => {
  if (!components || typeof components !== "object") {
    console.warn("⚠️ 批量注册组件失败：参数无效");
    return false;
  }

  let successCount = 0;
  Object.entries(components).forEach(([path, component]) => {
    if (registerComponent(path, component)) {
      successCount++;
    }
  });

  console.log(
    `✅ 批量组件注册完成: ${successCount}/${Object.keys(components).length}`
  );
  return successCount > 0;
};

/**
 * 从后端API获取组件映射配置
 * 支持动态更新组件映射表
 */
export const loadComponentMappingFromAPI = async () => {
  try {
    console.log("🔄 从后端获取组件映射配置...");

    // 调用后端API获取组件映射
    const response = await menuApi.getComponentMapping();

    if (response.data && response.data.code === 200 && response.data.data) {
      const mappings = response.data.data;
      let registeredCount = 0;

      // 清空现有映射
      componentMap.clear();

      // 将后端返回的映射注册到组件映射表
      console.log(`📦 后端返回的组件映射数据:`, mappings);

      Object.entries(mappings).forEach(([key, componentPath]) => {
        try {
          console.log(`🔧 开始处理组件映射: ${key} -> ${componentPath}`);

          // 创建动态导入函数
          const componentImport = () => {
            console.log(`🚀 执行组件加载: ${key}`);
            console.log(`📍 组件标识: ${componentPath}`);

            // 根据约定构建完整的组件路径
            // componentPath现在是简洁格式，如: "system/user"
            // 需要构建为: "../pages/system/user/UserPage.vue"
            const pathParts = componentPath.split("/");
            const moduleName = pathParts[pathParts.length - 1]; // 获取最后一部分，如 "user"
            const capitalizedModule =
              moduleName.charAt(0).toUpperCase() + moduleName.slice(1); // "User"
            const fullModulePath = `../pages/${componentPath}/${capitalizedModule}Page.vue`;

            console.log(`🔗 构建的完整模块路径: ${fullModulePath}`);

            // 使用预加载的模块进行动态导入
            if (modules[fullModulePath]) {
              console.log(`✅ 找到预加载模块: ${fullModulePath}`);
              return modules[fullModulePath]();
            } else {
              // 尝试找到匹配的模块
              const matchedPath = Object.keys(modules).find(
                (path) =>
                  path.includes(componentPath) && path.includes("Page.vue")
              );

              if (matchedPath) {
                console.log(
                  `✅ 找到匹配模块: ${componentPath} -> ${matchedPath}`
                );
                return modules[matchedPath]();
              } else {
                console.error(`❌ 未找到组件模块: ${componentPath}`);
                console.log(`📋 期望路径: ${fullModulePath}`);
                console.log(`📋 可用模块列表:`, Object.keys(modules));

                // 返回错误页面
                const errorPagePath = "../pages/ErrorNotFound.vue";
                if (modules[errorPagePath]) {
                  return modules[errorPagePath]();
                } else {
                  throw new Error(
                    `组件加载失败且错误页面不存在: ${componentPath}`
                  );
                }
              }
            }
          };

          componentMap.set(key, componentImport);
          registeredCount++;
          console.log(`✅ 组件映射注册成功: ${key} -> ${componentPath}`);
        } catch (error) {
          console.error(`❌ 注册组件映射失败: ${key}`, error);
        }
      });

      componentMappingLoaded = true;
      console.log(
        `✅ 从API加载组件映射完成: ${registeredCount}/${
          Object.keys(mappings).length
        }`
      );

      return { success: true, count: registeredCount };
    } else {
      console.warn("⚠️ 后端组件映射数据格式异常:", response.data);
      return { success: false, error: "数据格式异常" };
    }
  } catch (error) {
    console.error("❌ 从API获取组件映射失败:", error);

    // 如果API失败，设置一些基本的映射作为回退
    console.log("🔄 使用回退组件映射...");
    console.log("🔄 使用回退组件映射...");
    setFallbackComponentMapping();

    return { success: false, error: error.message };
  }
};

/**
 * 设置回退的组件映射
 * 当API失败时使用
 */
const setFallbackComponentMapping = () => {
  const fallbackMappings = {
    "system/user": "system/user",
    "system/role": "system/role",
    "system/menu": "system/menu",
    "system/log": "system/log",
  };

  Object.entries(fallbackMappings).forEach(([key, componentPath]) => {
    const componentImport = () => {
      // 使用改进的路径构建逻辑
      const pathParts = componentPath.split("/");
      const moduleName = pathParts[pathParts.length - 1];
      const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
      
      // 尝试多种路径格式
      const possiblePaths = [
        `../pages/${componentPath}/${capitalizedModule}Page.vue`,
        `../pages/${componentPath}Page.vue`,
        `../pages/${componentPath}.vue`,
      ];

      for (const path of possiblePaths) {
        if (modules[path]) {
          console.log(`✅ 回退映射找到模块: ${key} -> ${path}`);
          return modules[path]();
        }
      }

      // 如果都找不到，返回错误页面
      console.warn(`⚠️ 回退映射未找到组件: ${key}`);
      return (
        modules["../pages/ErrorNotFound.vue"]?.() ||
        Promise.reject(new Error("ErrorNotFound.vue not found"))
      );
    };
    componentMap.set(key, componentImport);
  });

  componentMappingLoaded = true;
  console.log("✅ 回退组件映射设置完成");
};

/**
 * 获取已注册的组件列表
 */
export const getRegisteredComponents = () => {
  return Array.from(componentMap.keys());
};

/**
 * 获取组件映射表的详细信息
 */
export const getComponentMapInfo = () => {
  return {
    total: componentMap.size,
    components: Array.from(componentMap.keys()),
    loaded: componentMappingLoaded,
  };
};

/**
 * 清除动态注册的组件（保留预定义组件）
 */
export const clearAllComponents = () => {
  const clearCount = componentMap.size;
  componentMap.clear();
  componentMappingLoaded = false;

  console.log(`🧹 清除所有组件完成: ${clearCount} 个组件`);
  return clearCount;
};

/**
 * 验证组件路径是否存在
 * 可以用于运行时检查组件是否可用
 */
export const validateComponentPath = async (componentPath) => {
  const component = getComponent(componentPath);
  if (!component) {
    return { valid: false, error: "组件未找到" };
  }

  try {
    await component();
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};
