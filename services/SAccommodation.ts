import Model from '../models';
import { AddAccommodationAttributes, AddRoomAttributes } from '../interfaces/IAccommodation';

class AccommodationService {
  public async getAccommodationList() {
    const list = await Model.Accommodation.findAll({
      include: [
        {
          model: Model.Images,
          as: 'accommodation_images',
          require: true,
        },
      ],
      attributes: ['sigungu', 'bname', 'label', 'id'],
      order: [[{ model: Model.Images, as: 'accommodation_images' }, 'seq', 'ASC']],
    });

    return list;
  }

  public async getAccommodationOne(payload: { accommodation_id: number }) {
    const accommodation_id = payload.accommodation_id;

    const accommodation = await Model.Accommodation.findOne({
      include: [
        {
          model: Model.Rooms,
          as: 'accommodation_rooms',
          require: true,
          include: [
            {
              model: Model.Images,
              as: 'rooms_images',
              require: true,
              order: ['seq', 'ASC'],
            },
          ],
        },
        {
          model: Model.Images,
          as: 'accommodation_images',
          require: true,
          order: ['seq', 'ASC'],
        },
      ],
      where: { id: accommodation_id },
      order: [
        [{ model: Model.Rooms, as: 'accommodation_rooms' }, 'seq', 'ASC'],
        [{ model: Model.Rooms, as: 'accommodation_rooms' }, { model: Model.Images, as: 'rooms_images' }, 'seq', 'ASC'],
        [{ model: Model.Images, as: 'accommodation_images' }, 'seq', 'ASC'],
      ],
    });

    return accommodation;
  }

  public async addManagerAccommodationList(payload: AddAccommodationAttributes) {
    const data = payload.data;
    const manager = payload.manager;
    const accommodation = await Model.Accommodation.create(
      {
        bname: data.bname,
        building_name: data.building_name,
        detail_address: data.detail_address,
        label: data.label,
        sido: data.sido,
        sigungu: data.sigungu,
        zonecode: data.zonecode,
        road_address: data.road_address,
        manager: manager,
        introduction: data.introduction,
      },
      {
        fields: [
          'bname',
          'building_name',
          'detail_address',
          'label',
          'sido',
          'sigungu',
          'zonecode',
          'road_address',
          'manager',
          'introduction',
        ],
      },
    );

    const accommodation_id = accommodation.dataValues.id;

    const data_rooms = [];
    for (const x of data.rooms) {
      data_rooms.push({
        ...x,
        accommodation_id: accommodation_id,
      });
    }
    const rooms = await Model.Rooms.bulkCreate(data_rooms, {
      fields: [
        'label',
        'maximum_num',
        'price',
        'standard_num',
        'accommodation_id',
        'amenities',
        'additional_info',
        'seq',
      ],
    });

    return { accommodation_id, rooms };
  }

  public async getManagerAccommodationList(payload: { manager: number; page: number }) {
    const manager = payload.manager;
    const page = payload.page;
    const count = await Model.Accommodation.count({
      where: {
        manager: manager,
      },
    });

    let offset = 0;
    if (page > 1) {
      offset = 5 * (page - 1);
    }

    const list = await Model.Accommodation.findAll({
      where: {
        manager: manager,
      },
      include: [
        {
          model: Model.Rooms,
          as: 'accommodation_rooms',
          require: true,
        },
        {
          model: Model.Images,
          as: 'accommodation_images',
          require: true,
        },
      ],
      offset: offset,
      limit: 5,
      order: [[{ model: Model.Images, as: 'accommodation_images' }, 'seq', 'ASC']],
    });

    return { count: count, rows: list };
  }

  public async addManagerAccommodationRoomList(payload: AddRoomAttributes) {
    const accommodation_id = payload.accommodation_id;
    const data = payload.data;

    const tmp_category = await Model.Rooms.findAll({
      where: {
        accommodation_id,
      },
      order: [['seq', 'DESC']],
      limit: 1,
    });

    const seq = Number(tmp_category[0].dataValues.seq) + 1;

    const rooms = await Model.Rooms.create(
      { ...data, seq: seq },
      {
        fields: [
          'label',
          'maximum_num',
          'price',
          'standard_num',
          'accommodation_id',
          'amenities',
          'additional_info',
          'seq',
        ],
      },
    );
    return rooms;
  }

  public async getManagerAccommodationRoomList(payload: { manager: number; page: number }) {
    const manager = payload.manager;
    const page = payload.page;

    let offset = 0;
    if (page > 1) {
      offset = 5 * (page - 1);
    }

    const tempSQL = Model.sequelize.dialect.queryGenerator
      .selectQuery('accommodation', {
        attributes: ['id'],
        where: {
          manager: manager,
        },
      })
      .slice(0, -1);

    const count = await Model.Rooms.count({
      where: {
        accommodation_id: {
          [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`),
        },
      },
    });

    const list = await Model.Rooms.findAll({
      where: {
        accommodation_id: {
          [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`),
        },
      },
      include: [
        {
          model: Model.Images,
          as: 'rooms_images',
          require: true,
        },
      ],
      attributes: [
        'id',
        'seq',
        'label',
        'price',
        'standard_num',
        'maximum_num',
        'amenities',
        'additional_info',
        'accommodation_id',
        [
          Model.sequelize.literal(`(
            SELECT label
            FROM accommodation
            WHERE
            id = rooms.accommodation_id
          )`),
          'accommodation_label',
        ],
      ],
      offset: offset,
      order: [
        ['seq', 'ASC'],
        [{ model: Model.Images, as: 'rooms_images' }, 'seq', 'ASC'],
      ],
      limit: 5,
    });

    return { count: count, rows: list };
  }

  async editManagerAccommodation(payload: { accommodation_id: number; target: string; value: string | number }) {
    const accommodation_id = payload.accommodation_id;
    const target = payload.target;
    const value = payload.value;

    const code = await Model.Accommodation.update(
      { [target]: value },
      {
        where: {
          id: accommodation_id,
        },
      },
    );

    if (code >= 0) {
      return true;
    } else {
      return false;
    }
  }

  async editManagerAccommodationRoom(payload: {
    accommodation_id: number;
    rooms_id: number;
    target: string;
    value: string | number;
  }) {
    const rooms_id = payload.rooms_id;
    const target = payload.target;
    const value = payload.value;

    console.log(rooms_id, target, value, 'editManagerAccommodationRoom');

    const code = await Model.Rooms.update(
      { [target]: value },
      {
        where: {
          id: rooms_id,
        },
      },
    );

    if (code >= 0) {
      return true;
    } else {
      return false;
    }
  }

  async deleteManagerAccommodationList(payload: { accommodation_id: number }) {
    const accommodation_id = payload.accommodation_id;

    const code1 = await Model.Accommodation.destroy({
      where: {
        id: accommodation_id,
      },
    });

    const code2 = await Model.Rooms.destroy({
      where: {
        accommodation_id: accommodation_id,
      },
    });

    if (code1 >= 0 && code2 >= 0) {
      return true;
    } else {
      return false;
    }
  }

  async deleteManagerAccommodationRoomList(payload: { accommodation_id: number; rooms_id: number }) {
    const rooms_id = payload.rooms_id;

    const code = await Model.Rooms.destroy({
      where: {
        id: rooms_id,
      },
    });

    if (code >= 0) {
      return true;
    } else {
      return false;
    }
  }

  async editManagerAccommodationRoomListOrder(payload: { id: number; seq: number }[]) {
    const data = payload;

    const f_res = [];
    for (const x of data) {
      const res = await Model.Rooms.update({ seq: x.seq }, { where: { id: x.id } });

      if (res) {
        f_res.push(res);
      } else {
        return false;
      }
    }

    return f_res;
  }
}

export default AccommodationService;
