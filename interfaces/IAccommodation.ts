export interface AddAccommodationAttributes {
  manager: number;
  data: {
    bname: string;
    building_name: string;
    detail_address: string;
    label: string;
    sido: string;
    sigungu: string;
    zonecode: string;
    road_address: string;
    introduction: string;
    rooms: {
      label: string;
      price: number;
      maximum_num: number;
      standard_num: number;
      amenities: string;
      additional_info: number;
      seq: number;
    }[];
  };
}

export interface AddRoomAttributes {
  accommodation_id: number;
  data: {
    label: string;
    price: number;
    maximum_num: number;
    standard_num: number;
    amenities: string;
    additional_info: number;
  }[];
}
