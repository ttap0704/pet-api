export { };

declare global {
  interface File {
    path: string;
  }

  interface AddAccommodationAttributes {
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
      contact: string;
      site: string;
      kakao_chat: string;
      peak_season: string[][];
      rooms: RoomsType[];
    };
  }

  interface RoomsType {
    label: string;
    normal_price: number;
    normal_weekend_price: number;
    peak_price: number;
    peak_weekend_price: number;
    maximum_num: number;
    standard_num: number;
    entrance: string;
    leaving: string;
    amenities: string;
    additional_info: number;
    seq: number;
  }

  interface AddRoomAttributes {
    accommodation_id: number;
    data: RoomsType[];
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

  interface JoinCertificationType {
    id: number;
    cert_num: string;
  }

  interface JoinCertificationRowType extends JoinCertificationType {
    manager: number
  }

  interface BusinessType {
    id: number;
    b_nm: string
    b_no: string
    b_sector: string
    b_type: string
    p_nm: string
    start_dt: string
  }

  interface ServiceInfoType {
    contact: string;
    site: string;
    kakao_chat: string;
  }

  interface RestaurantServiceInfoType extends ServiceInfoType {
    open: string;
    close: string;
    last_order: string;
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

