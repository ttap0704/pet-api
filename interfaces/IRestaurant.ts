export interface RestaurantAttributes {
  id: number;
  bname: string | null;
  building_name: string | null;
  detail_address: string | null;
  label: string;
  sido: string | null;
  sigungu: string | null;
  zonecode: string | null;
  road_address: string | null;
  introduction: string | null;
}

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
    sido: string;
    sigungu: string;
    zonecode: string;
    road_address: string;
    introduction: string;
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

export interface AddManagerRestaurantMenuListAttributes {
  restaurant_id: number;
  menu: string;
  data: {
    label?: string;
    price?: number;
    comment?: string;
  }[];
}

export interface AddManagerRestaurantCategoryMenuListAttributes {
  category_id: number;
  menu: {
    category_id: number;
    seq: number;
    label: string;
    price: number;
    restaurant_id: number;
  }[];
}
