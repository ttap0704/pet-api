import Model from "../models"
import {
  AddRestaurantAttributes,
  Category,
  GetManagerRestaurantListAttributes,
  AddManagerRestaurantMenuListAttributes,
  AddManagerRestaurantCategoryMenuListAttributes
} from "../interfaces/IRestaurant"


class RestaurantService {
  public async getRestaurantList() {
    const list = await Model.Restaurant.findAll({
      include: [
        {
          model: Model.Images,
          as: 'restaurant_images',
          require: true,
        }
      ],
      attributes: ['sigungu', 'bname', 'label', 'id'],
      order: [[{ model: Model.Images, as: 'restaurant_images' }, 'seq', 'ASC']],
    });

    return list;
  }

  public async getRestaurantOne(payload: { restaurant_id: number }) {
    const restaurant_id = payload.restaurant_id

    const restaurant = await Model.Restaurant.findOne({
      include: [
        {
          model: Model.ExposureMenu,
          as: 'exposure_menu',
          require: true,
          include: [
            {
              model: Model.Images,
              as: 'exposure_menu_image',
              require: true,
            }
          ],
          order: [[Model.Images, 'seq', 'ASC']]
        },
        {
          model: Model.EntireMenuCategory,
          as: 'entire_menu_category',
          require: true,
          include: [
            {
              model: Model.EntireMenu,
              as: 'menu',
              require: true,
            }
          ],
        },
        {
          model: Model.Images,
          as: 'restaurant_images',
          require: true,
        }
      ],
      order: [
        [{ model: Model.Images, as: 'restaurant_images' }, 'seq', 'ASC'],
        [{ model: Model.EntireMenuCategory, as: 'entire_menu_category' }, 'seq', 'ASC'],
        [{ model: Model.EntireMenuCategory, as: 'entire_menu_category' }, { model: Model.EntireMenu, as: 'menu' }, 'seq', 'ASC'],
        [{ model: Model.ExposureMenu, as: 'exposure_menu' }, 'seq', 'ASC']
      ],
      where: { id: restaurant_id },
    })

    return restaurant;
  }


  public async addManagerRestaurantList(payload: AddRestaurantAttributes) {
    // this.logger.info("url:::::::" + req.url);
    const manager = payload.manager;
    const data = payload.data;
    const restaurant = await Model.Restaurant.create({
      bname: data.bname,
      building_name: data.building_name,
      detail_address: data.detail_address,
      label: data.label,
      sido: data.sido,
      sigungu: data.sigungu,
      zonecode: data.zonecode,
      road_address: data.road_address,
      manager: manager,
      introduction: data.introduction
    }, {
      fields: ['bname', 'building_name', 'detail_address', 'label', 'sido', 'sigungu', 'zonecode', 'road_address', 'manager', 'introduction']
    });

    const restaurant_id = restaurant.dataValues.id;

    let category: { category: string, seq: number, restaurant_id: number }[] = [];
    for (let i = 0, leng = data.entireMenu.length; i < leng; i++) {
      category.push({
        category: data.entireMenu[i].category,
        seq: data.entireMenu[i].seq,
        restaurant_id: restaurant_id
      });
    };

    let entire_menu_category_arr: Category[] = [];
    for (let x of category) {
      const entire_menu_category = await Model.EntireMenuCategory.findOrCreate({ where: { category: x.category, restaurant_id: restaurant_id, seq: x.seq } });
      entire_menu_category_arr.push({
        id: entire_menu_category[0].dataValues.id,
        category: entire_menu_category[0].dataValues.category,
        seq: entire_menu_category[0].dataValues.seq,
        restaurant_id: restaurant_id
      })
    }

    let entire_menu_bulk = [];
    for (let x of data.entireMenu) {
      const idx = entire_menu_category_arr.findIndex((item: Category) => {
        return item.category == x.category
      });

      for (let i = 0, leng = x.menu.length; i < leng; i++) {
        entire_menu_bulk.push({
          label: x.menu[i].label,
          price: x.menu[i].price,
          seq: x.menu[i].seq,
          category_id: entire_menu_category_arr[idx].id,
          restaurant_id: restaurant_id,
        })
      }
    }

    let exposure_menu_bulk = [];
    for (let x of data.exposureMenu) {
      exposure_menu_bulk.push({
        label: x.label,
        price: x.price,
        comment: x.comment,
        restaurant_id: restaurant_id,
        seq: x.seq
      })
    }

    const entire_menu = await Model.EntireMenu.bulkCreate(entire_menu_bulk, {
      individualHooks: true,
      fields: ['label', 'price', 'category_id', 'restaurant_id', 'seq']
    });
    const exposure_menu = await Model.ExposureMenu.bulkCreate(exposure_menu_bulk, {
      individualHooks: true,
      fields: ['label', 'price', 'comment', 'restaurant_id', 'seq']
    })

    const menus: object = {
      restaurant_id,
      entire_menu,
      exposure_menu
    }

    return menus;
  }

  public async getManagerRestaurantList(payload: GetManagerRestaurantListAttributes) {
    const manager = payload.manager;
    const page = payload.page;

    const count = await Model.Restaurant.count({
      where: {
        manager: manager
      }
    })

    let offset = 0;
    if (page > 1) {
      offset = 5 * (page - 1);
    }

    const list = await Model.Restaurant.findAll({
      where: {
        manager: manager
      },
      include: [
        {
          model: Model.ExposureMenu,
          as: 'exposure_menu',
          require: true
        },
        {
          model: Model.EntireMenu,
          as: 'entire_menu',
          require: true
        },
        {
          model: Model.Images,
          as: 'restaurant_images',
          attributes: ['seq', 'id', 'file_name', 'category', 'restaurant_id']
        }
      ],
      order: [[{ model: Model.Images, as: 'restaurant_images' }, 'seq', 'ASC']],
      offset: offset,
      limit: 5,
    });

    return { count, rows: list }
  }

  public async getManagerRestaurantMenuList(payload: { manager: number, page: number, menu: string }) {
    const manager = payload.manager;
    const page = payload.page;
    const menu = payload.menu;
    const tempSQL = Model.sequelize.dialect.queryGenerator.selectQuery('restaurant', {
      attributes: ['id'],
      where: {
        manager: manager,
      }
    })
      .slice(0, -1);

    let offset = 0;
    if (page > 1) {
      offset = 5 * (page - 1);
    }

    let list;
    let count;
    if (menu == 'exposure_menu') {
      count = await Model.ExposureMenu.count({
        where: {
          restaurant_id: {
            [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`)
          }
        }
      })

      list = await Model.ExposureMenu.findAll({
        where: {
          restaurant_id: {
            [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`)
          }
        },
        include: [
          {
            model: Model.Images,
            as: 'exposure_menu_image',
            require: true,
          }
        ],
        attributes: ['id', 'label', 'price', 'restaurant_id', 'comment', [
          Model.sequelize.literal(`(
            SELECT label
            FROM restaurant
            WHERE
            id = ExposureMenu.restaurant_id
          )`), 'restaurant_label'
        ]],
        offset: offset,
        limit: 5
      });
    } else if (menu == 'entire_menu') {
      count = await Model.EntireMenu.count({
        where: {
          restaurant_id: {
            [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`)
          }
        }
      })

      const attributes = ['id', 'label', 'price', 'restaurant_id', 'category_id', [
        Model.sequelize.literal(`(
          SELECT category
          FROM entire_menu_category
          WHERE
          id = EntireMenu.category_id
        )`), 'category'
      ], [
          Model.sequelize.literal(`(
          SELECT label
          FROM restaurant
          WHERE
          id = EntireMenu.restaurant_id
        )`), 'restaurant_label'
        ]]

      list = await Model.EntireMenu.findAll({
        where: {
          restaurant_id: {
            [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`)
          }
        },
        attributes: attributes,
        offset: offset,
        limit: 5
      });
    } else if (menu == 'category') {
      count = await Model.EntireMenuCategory.count({
        where: {
          restaurant_id: {
            [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`)
          }
        }
      })

      const attributes = ['id', 'restaurant_id', 'category', [
        Model.sequelize.literal(`(
          SELECT label
          FROM restaurant
          WHERE
          id = EntireMenuCategory.restaurant_id
        )`), 'restaurant_label'
      ]]

      list = await Model.EntireMenuCategory.findAll({
        where: {
          restaurant_id: {
            [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`)
          }
        },
        include: [
          {
            model: Model.EntireMenu,
            as: 'menu',
            require: true,
          }
        ],
        offset: offset,
        attributes,
        limit: 5
      })
    }

    return { count, rows: list };
  }


  public async getManagerRestaurantCategoryList(payload: { restaurant_id: number }) {
    const restaurant_id = payload.restaurant_id;
    const category = await Model.EntireMenuCategory.findAll({
      where: {
        restaurant_id: restaurant_id
      },
      include: [
        {
          model: Model.EntireMenu,
          as: 'menu',
          require: true,
        }
      ],
    })

    return category;
  }

  public async addManagerRestaurantCategoryList(payload: { restaurant_id: number, category: string }) {
    const restaurant_id = payload.restaurant_id;
    const category = payload.category;

    const tmp_category = await Model.EntireMenuCategory.findAll({
      where: {
        restaurant_id,
      },
      order: [['seq', 'DESC']],
      limit: 1
    })

    const seq = Number(tmp_category[0].dataValues.seq) + 1;

    const res_category = await Model.EntireMenuCategory.create({
      category,
      seq,
      restaurant_id
    })

    return res_category;
  }

  public async editManagerRestaurantCategoryList(payload: { category_id: number, target: string, value: string }) {
    const category_id = payload.category_id;
    const target = payload.target;
    const value = payload.value;

    const code = await Model.EntireMenuCategory.update({ [target]: value }, {
      where: {
        id: category_id
      }
    })

    if (code >= 0) {
      return true;
    } else {
      return false;
    }
  }

  public async deleteManagerRestauranCateogrytList(payload: { category_id: number }) {
    const category_id = payload.category_id;

    const code1 = await Model.EntireMenu.destroy({
      where: {
        category_id
      }
    })

    const code2 = await Model.EntireMenuCategory.destroy({
      where: {
        id: category_id
      }
    })


    if (code1 >= 0 && code2 >= 0) {
      return true;
    } else {
      return false;
    }
  }

  public async addManagerRestaurantCategoryMenuList(payload: AddManagerRestaurantCategoryMenuListAttributes) {
    const category_id = payload.category_id;
    const menu = payload.menu;

    const bulk_data = menu.map((item) => {
      return {
        label: item.label,
        price: item.price,
        seq: item.seq,
        category_id: item.category_id,
        restaurant_id: item.restaurant_id
      }
    })

    const menus = await Model.EntireMenu.bulkCreate(bulk_data, { fields: ['label', 'price', 'category_id', 'restaurant_id', 'seq'] })

    return menus;
  }

  public async deleteManagerRestaurantCategoryMenuList(payload: { category_id: number }) {
    const category_id = payload.category_id;

    const code = await Model.EntireMenu.destroy({
      where: {
        category_id
      }
    })

    if (code >= 0) {
      return true;
    } else {
      return false;
    }
  }

  public async addManagerRestaurantMenuList(payload: AddManagerRestaurantMenuListAttributes) {
    const restaurant_id = payload.restaurant_id;
    const menu = payload.menu;
    const body = payload.data;
    if (menu == 'exposure_menu') {

      const tmp_category = await Model.ExposureMenu.findAll({
        where: {
          restaurant_id,
        },
        order: [['seq', 'DESC']],
        limit: 1
      })

      const seq = Number(tmp_category[0].dataValues.seq) + 1;

      const data = {
        label: body.label,
        price: Number(body.price),
        comment: body.comment,
        restaurant_id: restaurant_id,
        seq: seq
      }

      const res_menu = await Model.ExposureMenu.create(data, { fields: ['label', 'price', 'comment', 'restaurant_id', 'id', 'seq'] });

      return res_menu;
    }
  }

  async editManagerRestaurant(payload: { restaurant_id: number, target: string, value: string }) {
    const restaurant_id = payload.restaurant_id;
    const target = payload.target;
    const value = payload.value;

    const code = await Model.Restaurant.update({ [target]: value }, {
      where: {
        id: restaurant_id
      }
    })

    if (code >= 0) {
      return true;
    } else {
      return false;
    }
  }

  async editManagerRestaurantMenu(payload: { restaurant_id: number, target: string, value: string, menu: string, menu_id: number }) {
    const restaurant_id = payload.restaurant_id;
    const target = payload.target;
    const value = payload.value;
    const menu = payload.menu;
    const menu_id = payload.menu_id;

    let target_model = "";
    if (menu == 'exposure_menu') {
      target_model = 'ExposureMenu'
    } else {
      target_model = 'EntireMenu'
    }

    const code = await Model[target_model].update({ [target]: value }, {
      where: {
        restaurant_id: restaurant_id,
        id: menu_id
      }
    })

    if (code >= 0) {
      return true;
    } else {
      return false;
    }
  }

  async deleteManagerRestaurantList(payload: { restaurant_id: number }) {
    const restaurant_id = payload.restaurant_id;

    const code1 = await Model.EntireMenu.destroy({
      where: {
        restaurant_id
      }
    })

    const code2 = await Model.ExposureMenu.destroy({
      where: {
        restaurant_id
      }
    })

    const code3 = await Model.Restaurant.destroy({
      where: {
        id: restaurant_id
      }
    })

    if (code1 >= 0 && code2 >= 0 && code3 >= 0) {
      return true;
    } else {
      return false;
    }
  }

  async deleteManagerRestaurantMenuList(payload: { restaurant_id: number, menu: string, menu_id: number }) {
    const restaurant_id = payload.restaurant_id;
    const menu = payload.menu;
    const menu_id = payload.menu_id;

    let target_model = "";
    if (menu == 'exposure_menu') {
      target_model = 'ExposureMenu'
    } else {
      target_model = 'EntireMenu'
    }

    const code = await Model[target_model].destroy({
      where: {
        restaurant_id,
        id: menu_id
      }
    })

    if (code >= 0) {
      return true;
    } else {
      return false;
    }
  }
}

export default RestaurantService