import Model from '../models';

class AccommodationService {
  public async getAccommodationList(query: { types: string, location: string }) {

    const { types, location } = query

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


    const list = await Model.Accommodation.findAll({
      include: [
        {
          model: Model.Images,
          as: 'accommodation_images',
          require: true,
          attributes: ['file_name'],
        },
      ],
      attributes: ['sido', 'sigungu', 'bname', 'label', 'id'],
      order: [[{ model: Model.Images, as: 'accommodation_images' }, 'seq', 'ASC']],
      where: {
        ...where,
      }
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
            },
          ],
        },
        {
          model: Model.Images,
          as: 'accommodation_images',
          require: true,
        },
        {
          model: Model.AccommodationPeakSeason,
          as: 'accommodation_peak_season',
          require: true,
        }
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
        ],
      },
    );

    const accommodation_id = accommodation.dataValues.id;

    const peak_season_data = [];
    for (const x of data.peak_season) {
      peak_season_data.push({
        start: x[0],
        end: x[1],
        accommodation_id: accommodation_id,
      })
    }
    const peak_season = await Model.AccommodationPeakSeason.bulkCreate(peak_season_data);

    const data_rooms = [];
    for (const x of data.rooms) {
      data_rooms.push({
        ...x,
        accommodation_id: accommodation_id,
      });
    }
    const rooms = await Model.Rooms.bulkCreate(data_rooms);

    return { accommodation_id, peak_season, rooms };
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
          model: Model.AccommodationPeakSeason,
          as: 'accommodation_peak_season',
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
      order: [
        [{ model: Model.Images, as: 'accommodation_images' }, 'seq', 'ASC'],
        [{ model: Model.Rooms, as: 'accommodation_rooms' }, 'seq', 'ASC']
      ],
    });

    return { count: count, rows: list };
  }

  public async addManagerAccommodationRoomList(payload: AddRoomAttributes) {
    const accommodation_id = payload.accommodation_id;
    const data = payload.data;

    const tmp_rooms = await Model.Rooms.findAll({
      where: {
        accommodation_id,
      },
      order: [['seq', 'DESC']],
      limit: 1,
    });

    let seq = 0;
    if (tmp_rooms.length > 0) {
      seq = Number(tmp_rooms[0].dataValues.seq) + 1
    }
    const bulk_data = []
    for (const list of data) {
      bulk_data.push({
        ...list,
        seq: seq
      })
      seq++;
    }

    const rooms = await Model.Rooms.bulkCreate(bulk_data);
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
        'normal_price',
        'normal_weekend_price',
        'peak_price',
        'peak_weekend_price',
        'standard_num',
        'maximum_num',
        'amenities',
        'entrance',
        'leaving',
        'additional_info',
        'accommodation_id',
        'createdAt',
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

  public async updateManagerAccommodationAddress(payload: { accommodation_id: number; address: AddressType }) {
    const accommodation_id = payload.accommodation_id;
    const address = payload.address;

    const code = await Model.Accommodation.update(
      { ...address },
      {
        where: {
          id: accommodation_id,
        },
      },
    );

    if (code >= 0) {
      return { address, accommodation_id };
    } else {
      return false;
    }
  }

  public async updateManagerAccommodationServiceInfo(payload: { accommodation_id: number; service_info: ServiceInfoType }) {
    const accommodation_id = payload.accommodation_id;
    const service_info = payload.service_info;

    const code = await Model.Accommodation.update(
      { ...service_info },
      {
        where: {
          id: accommodation_id,
        },
      },
    );

    if (code >= 0) {
      return { service_info, accommodation_id };
    } else {
      return false;
    }
  }

  public async updateManagerAccommodationSeasonData(payload: { accommodation_id: number; season: PeakSeasontype[] }) {
    const accommodation_id = payload.accommodation_id;
    const season = payload.season;

    await Model.AccommodationPeakSeason.destroy(
      {
        where: {
          accommodation_id: accommodation_id,
        },
      },
    );

    const season_data = season.map(item => {
      return {
        ...item,
        accommodation_id
      }
    })
    const new_season = await Model.AccommodationPeakSeason.bulkCreate(season_data);

    if (new_season.length >= 0) {
      return new_season;
    } else {
      return false;
    }
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

  async editManagerAccommodationRoomListOrder(payload: { manager: number, accommodation_id: number, data: { id: number, seq: number }[] }) {
    const manager = payload.manager;
    const accommodation_id = payload.accommodation_id;
    const data = payload.data;

    const f_res = [];
    for (const x of data) {
      const res = await Model.Rooms.update({ seq: x.seq }, { where: { id: x.id, accommodation_id } });

      if (res) {
        f_res.push(res);
      } else {
        return false;
      }
    }

    return f_res;
  }

  async editManagerAccommodationRoomListInfo(payload: { manager: number, accommodation_id: number, rooms_id: number, data: RoomsType }) {
    const manager = payload.manager;
    const accommodation_id = payload.accommodation_id;
    const rooms_id = payload.rooms_id
    const data = payload.data;

    const code = await Model.Rooms.update({ ...data }, { where: { id: rooms_id, accommodation_id } });

    if (code >= 0) {
      return true;
    } else {
      return false;
    }
  }
}

export default AccommodationService;
