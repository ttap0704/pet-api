export { };

declare global {
  interface File {
    path: string;
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

