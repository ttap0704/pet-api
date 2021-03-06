export interface Category {
  id: number;
  category: string;
  seq: number;
  restaurant_id: number;
}

export interface AddRestaurantAttributes {
  manager: number;
  data: {
    bname: string;
    building_name: string;
    detail_address: string;
    label: string;
    type: number;
    sido: string;
    sigungu: string;
    zonecode: string;
    road_address: string;
    introduction: string;
    contact: string;
    site: string;
    kakao_chat: string;
    open: string;
    close: string;
    last_order: string;
    entireMenu: {
      category: string;
      seq: number;
      menu: {
        label: string;
        price: number;
        seq: string;
      }[];
    }[];
    exposureMenu: {
      label: string;
      price: number;
      comment: string;
      seq: string;
    }[];
  };
}

export interface GetManagerRestaurantListAttributes {
  manager: number;
  page: number;
}

