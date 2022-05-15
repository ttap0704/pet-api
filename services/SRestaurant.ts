import Model from '../models';
import {
  AddRestaurantAttributes,
  Category,
  GetManagerRestaurantListAttributes,
} from '../interfaces/IRestaurant';

class RestaurantService {
  public async getRestaurantList(query: { types: string, location: string, menu: string }) {
    const { types, location, menu } = query

    const where: any = {}
    if (types) {
      where.type = {
        [Model.Sequelize.Op.in]: types ? types.split(',') : [1, 2, 3, 4],
      }
    }

    if (location) {
      where[Model.Sequelize.Op.or] = {
        ...where[Model.Sequelize.Op.or],
        sido: {
          [Model.Sequelize.Op.like]: `%${location}%`
        },
        sigungu: {
          [Model.Sequelize.Op.like]: `%${location}%`
        },
        bname: {
          [Model.Sequelize.Op.like]: `%${location}%`
        },
        road_address: {
          [Model.Sequelize.Op.like]: `%${location}%`
        },
      }
    }

    const list = await Model.Restaurant.findAll({
      include: [
        {
          model: Model.Images,
          as: 'restaurant_images',
          require: true,
        },
        {
          model: Model.ExposureMenu,
          as: 'exposure_menu',
          require: true,
          attributes: ['label'],
        },
        {
          model: Model.EntireMenuCategory,
          as: 'entire_menu_category',
          require: true,
          attributes: ['category'],
          include: [
            {
              model: Model.EntireMenu,
              as: 'menu',
              require: true,
              attributes: ['label'],
            },
          ],
        },
      ],
      attributes: ['sido', 'sigungu', 'bname', 'label', 'id',],
      order: [[{ model: Model.Images, as: 'restaurant_images' }, 'seq', 'ASC']],
      where: {
        ...where,
      }
    });

    return list;
  }

  public async getRestaurantOne(payload: { restaurant_id: number }) {
    const restaurant_id = payload.restaurant_id;

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
            },
          ],
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
            },
          ],
        },
        {
          model: Model.Images,
          as: 'restaurant_images',
          require: true,
        },
      ],
      order: [
        [{ model: Model.Images, as: 'restaurant_images' }, 'seq', 'ASC'],
        [{ model: Model.EntireMenuCategory, as: 'entire_menu_category' }, 'seq', 'ASC'],
        [
          { model: Model.EntireMenuCategory, as: 'entire_menu_category' },
          { model: Model.EntireMenu, as: 'menu' },
          'seq',
          'ASC',
        ],
        [{ model: Model.ExposureMenu, as: 'exposure_menu' }, 'seq', 'ASC'],
      ],
      where: { id: restaurant_id },
    });

    return restaurant;
  }

  public async addManagerRestaurantList(payload: AddRestaurantAttributes) {
    // this.logger.info("url:::::::" + req.url);
    const manager = payload.manager;
    const data = payload.data;
    const restaurant = await Model.Restaurant.create(
      {
        bname: data.bname,
        building_name: data.building_name,
        detail_address: data.detail_address,
        label: data.label,
        type: data.type,
        sido: data.sido,
        sigungu: data.sigungu,
        zonecode: data.zonecode,
        road_address: data.road_address,
        manager: manager,
        introduction: data.introduction,
        contact: data.contact,
        site: data.site,
        kakao_chat: data.kakao_chat,
        open: data.open,
        close: data.close,
        last_order: data.last_order,
      },
      {
        fields: [
          'bname',
          'building_name',
          'detail_address',
          'label',
          'type',
          'sido',
          'sigungu',
          'zonecode',
          'road_address',
          'manager',
          'introduction',
          'contact',
          'site',
          'kakao_chat',
          'open',
          'close',
          'last_order',
        ],
      },
    );

    const restaurant_id = restaurant.dataValues.id;

    const category: { category: string; seq: number; restaurant_id: number }[] = [];
    for (let i = 0, leng = data.entireMenu.length; i < leng; i++) {
      category.push({
        category: data.entireMenu[i].category,
        seq: data.entireMenu[i].seq,
        restaurant_id: restaurant_id,
      });
    }

    const entire_menu_category_arr: Category[] = [];
    for (const x of category) {
      const entire_menu_category = await Model.EntireMenuCategory.findOrCreate({
        where: { category: x.category, restaurant_id: restaurant_id, seq: x.seq },
      });
      entire_menu_category_arr.push({
        id: entire_menu_category[0].dataValues.id,
        category: entire_menu_category[0].dataValues.category,
        seq: entire_menu_category[0].dataValues.seq,
        restaurant_id: restaurant_id,
      });
    }

    const entire_menu_bulk = [];
    for (const x of data.entireMenu) {
      const idx = entire_menu_category_arr.findIndex((item: Category) => {
        return item.category == x.category;
      });

      for (let i = 0, leng = x.menu.length; i < leng; i++) {
        entire_menu_bulk.push({
          label: x.menu[i].label,
          price: x.menu[i].price,
          seq: x.menu[i].seq,
          category_id: entire_menu_category_arr[idx].id,
          restaurant_id: restaurant_id,
        });
      }
    }

    const exposure_menu_bulk = [];
    for (const x of data.exposureMenu) {
      exposure_menu_bulk.push({
        label: x.label,
        price: x.price,
        comment: x.comment,
        restaurant_id: restaurant_id,
        seq: x.seq,
      });
    }

    const entire_menu = await Model.EntireMenu.bulkCreate(entire_menu_bulk, {
      individualHooks: true,
      fields: ['label', 'price', 'category_id', 'restaurant_id', 'seq'],
    });
    const exposure_menu = await Model.ExposureMenu.bulkCreate(exposure_menu_bulk, {
      individualHooks: true,
      fields: ['label', 'price', 'comment', 'restaurant_id', 'seq'],
    });

    const menus: object = {
      restaurant_id,
      entire_menu,
      exposure_menu,
    };

    return menus;
  }

  public async getManagerRestaurantList(payload: GetManagerRestaurantListAttributes) {
    const manager = payload.manager;
    const page = payload.page;

    const count = await Model.Restaurant.count({
      where: {
        manager: manager,
      },
    });

    let offset = 0;
    if (page > 1) {
      offset = 5 * (page - 1);
    }

    const list = await Model.Restaurant.findAll({
      where: {
        manager: manager,
      },
      include: [
        {
          model: Model.ExposureMenu,
          as: 'exposure_menu',
          require: true,
        },
        {
          model: Model.EntireMenu,
          as: 'entire_menu',
          require: true,
        },
        {
          model: Model.EntireMenuCategory,
          as: 'entire_menu_category',
          require: true,
        },
        {
          model: Model.Images,
          as: 'restaurant_images',
          attributes: ['seq', 'id', 'file_name', 'category', 'restaurant_id'],
        },
      ],
      order: [
        [{ model: Model.ExposureMenu, as: 'exposure_menu' }, 'seq', 'ASC'],
        [{ model: Model.EntireMenu, as: 'entire_menu' }, 'seq', 'ASC'],
        [{ model: Model.EntireMenuCategory, as: 'entire_menu_category' }, 'seq', 'ASC'],
        [{ model: Model.Images, as: 'restaurant_images' }, 'seq', 'ASC']
      ],
      offset: offset,
      limit: 5,
    });

    return { count, rows: list };
  }

  public async getManagerRestaurantMenuList(payload: { manager: number; page: number; menu: string }) {
    const manager = payload.manager;
    const page = payload.page;
    const menu = payload.menu;
    const tempSQL = Model.sequelize.dialect.queryGenerator
      .selectQuery('restaurant', {
        attributes: ['id'],
        where: {
          manager: manager,
        },
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
            [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`),
          },
        },
      });

      list = await Model.ExposureMenu.findAll({
        where: {
          restaurant_id: {
            [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`),
          },
        },
        include: [
          {
            model: Model.Images,
            as: 'exposure_menu_image',
            require: true,
          },
        ],
        attributes: [
          'id',
          'label',
          'price',
          'restaurant_id',
          'comment',
          [
            Model.sequelize.literal(`(
            SELECT label
            FROM restaurant
            WHERE
            id = ExposureMenu.restaurant_id
          )`),
            'restaurant_label',
          ],
        ],
        offset: offset,
        limit: 5,
      });
    } else if (menu == 'entire_menu') {
      count = await Model.EntireMenu.count({
        where: {
          restaurant_id: {
            [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`),
          },
        },
      });

      const attributes = [
        'id',
        'label',
        'price',
        'restaurant_id',
        'category_id',
        [
          Model.sequelize.literal(`(
          SELECT category
          FROM entire_menu_category
          WHERE
          id = EntireMenu.category_id
        )`),
          'category',
        ],
        [
          Model.sequelize.literal(`(
          SELECT label
          FROM restaurant
          WHERE
          id = EntireMenu.restaurant_id
        )`),
          'restaurant_label',
        ],
      ];

      list = await Model.EntireMenu.findAll({
        where: {
          restaurant_id: {
            [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`),
          },
        },
        attributes: attributes,
        offset: offset,
        limit: 5,
      });
    } else if (menu == 'category') {
      count = await Model.EntireMenuCategory.count({
        where: {
          restaurant_id: {
            [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`),
          },
        },
      });

      const attributes = [
        'id',
        'restaurant_id',
        'category',
        [
          Model.sequelize.literal(`(
          SELECT label
          FROM restaurant
          WHERE
          id = EntireMenuCategory.restaurant_id
        )`),
          'restaurant_label',
        ],
      ];

      list = await Model.EntireMenuCategory.findAll({
        where: {
          restaurant_id: {
            [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`),
          },
        },
        include: [
          {
            model: Model.EntireMenu,
            as: 'menu',
            require: true,
          },
        ],
        order: [[{ model: Model.EntireMenu, as: 'menu' }, 'seq', 'ASC']],
        offset: offset,
        attributes,
        limit: 5,
      });
    }

    return { count, rows: list };
  }

  public async getManagerRestaurantCategoryList(payload: { restaurant_id: number }) {
    const restaurant_id = payload.restaurant_id;
    const category = await Model.EntireMenuCategory.findAll({
      where: {
        restaurant_id: restaurant_id,
      },
      include: [
        {
          model: Model.EntireMenu,
          as: 'menu',
          require: true,
        },
      ],
      order: [[{ model: Model.EntireMenu, as: 'menu' }, 'seq', 'ASC']],
    });

    return category;
  }

  public async addManagerRestaurantCategoryList(payload: { restaurant_id: number; category: string[] }) {
    const restaurant_id = payload.restaurant_id;
    const category = payload.category;

    const tmp_category = await Model.EntireMenuCategory.findAll({
      where: {
        restaurant_id,
      },
      order: [['seq', 'DESC']],
      limit: 1,
    });

    let seq = tmp_category[0] ? Number(tmp_category[0].dataValues.seq) : 0;
    const data = category.map((item) => {
      seq++;
      return {
        category: item,
        seq: seq,
        restaurant_id
      }
    });

    const res_category = await Model.EntireMenuCategory.bulkCreate(data);

    return res_category;
  }

  public async editManagerRestaurantCategoryList(payload: { category_id: number; target: string; value: string }) {
    const category_id = payload.category_id;
    const target = payload.target;
    const value = payload.value;

    const code = await Model.EntireMenuCategory.update(
      { [target]: value },
      {
        where: {
          id: category_id,
        },
      },
    );

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
        category_id,
      },
    });

    const code2 = await Model.EntireMenuCategory.destroy({
      where: {
        id: category_id,
      },
    });

    if (code1 >= 0 && code2 >= 0) {
      return true;
    } else {
      return false;
    }
  }

  public async addManagerRestaurantCategoryMenuList(payload: AddManagerRestaurantCategoryMenuListAttributes) {
    const restaurant_id = payload.restaurant_id
    const category_id = payload.category_id;
    const menu = payload.menu;

    const tmp_category = await Model.EntireMenu.findAll({
      where: {
        restaurant_id,
        category_id,
      },
      order: [['seq', 'DESC']],
      limit: 1,
    });

    let seq = tmp_category[0] ? Number(tmp_category[0].dataValues.seq) : 0;

    const data = menu.map((item) => {
      seq++;
      return {
        label: item.label,
        price: item.price,
        category_id,
        seq,
        restaurant_id
      }
    });

    const menus = await Model.EntireMenu.bulkCreate(data, {
      fields: ['label', 'price', 'category_id', 'restaurant_id', 'seq'],
    });

    return menus;
  }

  public async deleteManagerRestaurantCategoryMenuList(payload: { category_id: number }) {
    const category_id = payload.category_id;

    const code = await Model.EntireMenu.destroy({
      where: {
        category_id,
      },
    });

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
        limit: 1,
      });

      let seq = Number(tmp_category[0].dataValues.seq);
      const data = body.map((item) => {
        seq++;
        return {
          label: item.label,
          price: Number(item.price),
          comment: item.comment,
          restaurant_id: restaurant_id,
          seq: seq,
        }
      });

      const res_menu = await Model.ExposureMenu.bulkCreate(data, {
        fields: ['label', 'price', 'comment', 'restaurant_id', 'id', 'seq'],
      });

      return res_menu;
    } else if (menu == 'entire_menu') {
      const tmp_category = await Model.EntireMenu.findAll({
        where: {
          restaurant_id,
        },
        order: [['seq', 'DESC']],
        limit: 1,
      });

      let seq = Number(tmp_category[0].dataValues.seq);
      const data = body.map((item) => {
        seq++;
        return {
          label: item.label,
          price: Number(item.price),
          comment: item.comment,
          restaurant_id: restaurant_id,
          seq: seq,
        }
      });

      const res_menu = await Model.ExposureMenu.bulkCreate(data, {
        fields: ['label', 'price', 'comment', 'restaurant_id', 'id', 'seq'],
      });

      return res_menu;
    }
  }

  public async updateManagerRestaurantAddress(payload: { restaurant_id: number; address: AddressType }) {
    const restaurant_id = payload.restaurant_id;
    const address = payload.address;

    const code = await Model.Restaurant.update(
      { ...address },
      {
        where: {
          id: restaurant_id,
        },
      },
    );

    if (code >= 0) {
      return { address, restaurant_id };
    } else {
      return false;
    }
  }

  public async updateManagerRestaurantServiceInfo(payload: { restaurant_id: number; service_info: RestaurantServiceInfoType }) {
    const restaurant_id = payload.restaurant_id;
    const service_info = payload.service_info;

    const code = await Model.Restaurant.update(
      { ...service_info },
      {
        where: {
          id: restaurant_id,
        },
      },
    );

    if (code >= 0) {
      return { service_info, restaurant_id };
    } else {
      return false;
    }
  }

  async editManagerRestaurant(payload: { restaurant_id: number; target: string; value: string }) {
    const restaurant_id = payload.restaurant_id;
    const target = payload.target;
    const value = payload.value;

    const code = await Model.Restaurant.update(
      { [target]: value },
      {
        where: {
          id: restaurant_id,
        },
      },
    );

    if (code >= 0) {
      return true;
    } else {
      return false;
    }
  }

  async editManagerRestaurantMenuListOrder(payload: { restaurant_id: number; menu: string; data: { id: number, seq: number }[] }) {
    const restaurant_id = payload.restaurant_id;
    const menu = payload.menu;
    const data = payload.data;
    const f_res = [];
    for (const x of data) {
      let res = null;
      if (menu == 'exposure_menu') {
        res = await Model.ExposureMenu.update({ seq: x.seq }, { where: { id: x.id, restaurant_id } });
      } else if (menu == 'category') {
        res = await Model.EntireMenuCategory.update({ seq: x.seq }, { where: { id: x.id, restaurant_id } });
      } else if (menu == 'entire_menu') {
        res = await Model.EntireMenu.update({ seq: x.seq }, { where: { id: x.id, restaurant_id } });
      }

      if (res) {
        f_res.push(res);
      } else {
        return false;
      }
    }

    return f_res;
  }

  async editManagerRestaurantMenu(payload: {
    restaurant_id: number;
    target: string;
    value: string;
    menu: string;
    menu_id: number;
  }) {
    const restaurant_id = payload.restaurant_id;
    const target = payload.target;
    const value = payload.value;
    const menu = payload.menu;
    const menu_id = payload.menu_id;

    let target_model = '';
    if (menu == 'exposure_menu') {
      target_model = 'ExposureMenu';
    } else {
      target_model = 'EntireMenu';
    }

    const code = await Model[target_model].update(
      { [target]: value },
      {
        where: {
          restaurant_id: restaurant_id,
          id: menu_id,
        },
      },
    );

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
        restaurant_id,
      },
    });

    const code2 = await Model.ExposureMenu.destroy({
      where: {
        restaurant_id,
      },
    });

    const code3 = await Model.Restaurant.destroy({
      where: {
        id: restaurant_id,
      },
    });

    if (code1 >= 0 && code2 >= 0 && code3 >= 0) {
      return true;
    } else {
      return false;
    }
  }

  async deleteManagerRestaurantMenuList(payload: { restaurant_id: number; menu: string; menu_id: number }) {
    const restaurant_id = payload.restaurant_id;
    const menu = payload.menu;
    const menu_id = payload.menu_id;

    let target_model = '';
    if (menu == 'exposure_menu') {
      target_model = 'ExposureMenu';
    } else {
      target_model = 'EntireMenu';
    }

    const code = await Model[target_model].destroy({
      where: {
        restaurant_id,
        id: menu_id,
      },
    });

    if (code >= 0) {
      return true;
    } else {
      return false;
    }
  }
}

export default RestaurantService;
