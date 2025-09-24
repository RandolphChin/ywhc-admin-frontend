import { api } from "src/boot/axios";

/**
 * 代码生成API
 */
export const generatorApi = {
  /**
   * 获取数据库表列表
   */
  getTableList() {
    return api.get("/generator/tables");
  },

  /**
   * 获取表详细信息
   */
  getTableInfo(tableName) {
    return api.get(`/generator/tables/${tableName}`);
  },

  /**
   * 预览生成代码
   */
  previewCode(config) {
    return api.post("/generator/preview", config);
  },

  /**
   * 生成并下载代码
   */
  downloadCode(config) {
    return api.post("/generator/download", config, {
      responseType: "blob",
    });
  },
};
