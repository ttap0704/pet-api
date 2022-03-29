export { };

declare global {
  interface File {
    path: string;
  }

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
      peak_season: string[][];
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
      normal_price: number;
      normal_weekend_price: number;
      peak_price: number;
      peak_weekend_price: number;
      maximum_num: number;
      standard_num: number;
      amenities: string;
      additional_info: number;
    }[];
  }


  interface AddressType {
    bname: string;
    building_name: string;
    detail_address: string;
    label: string;
    sido: string;
    sigungu: string;
    zonecode: string;
    road_address: string;
  }

  interface PeakSeasontype {
    start: string;
    end: string;
  }


  interface ResponseCategoryType {
    id: number;
    category: string;
    seq: number;
  }

  interface RequestCategoryType {
    category: string;
    menu: {
      label: string;
      price: number;
    }[]
  }

  interface AddManagerRestaurantMenuListAttributes {
    restaurant_id: number;
    menu: string;
    data: {
      label?: string;
      price?: number;
      comment?: string;
    }[];
  }

  interface AddManagerRestaurantCategoryMenuListAttributes {
    restaurant_id: number;
    category_id: number;
    menu: {
      label: string;
      price: number;
    }[];
  }
}

