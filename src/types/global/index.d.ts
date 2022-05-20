import { Model } from 'sequelize';
export { };

declare global {
  interface File {
    path: string;
  }

  interface AccommodationAttributes {
    id: number;
    contact: string;
    site: string;
    kakao_chat: string;
    bname: string | null;
    building_name: string | null;
    detail_address: string | null;
    label: string;
    type: number;
    sido: string | null;
    sigungu: string | null;
    zonecode: string | null;
    road_address: string;
    introduction: string | null;
  }

  interface UsersAttributes {
    id: number;
    login_id: string;
    password: string | null;
    name: string;
    phone: string;
    wrong_num: number;
    nickname: string;
    profile_path: string;
    type: number;
    certification: number;
  }

  interface CreateUserAttributes {
    login_id: string;
    password: string | null;
    name: string;
    phone: string;
    nickname: string;
    profile_path: string;
    type: number;
  }

  interface LoginUserAttributes {
    id: string;
    password: string | null;
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
      type: number;
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

  interface RestaurantViewsCountAttributes {
    restaurant_id: number;
    views: number;
    postdate: string;
  }

  interface AccommodationViewsCountAttributes {
    accommodation_id: number;
    views: number;
    postdate: string;
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

  interface JoinCertificationAttributes {
    id: number;
    cert_num: string;
  }

  interface JoinCertificationRowType extends JoinCertificationAttributes {
    manager: number
  }

  interface BusinessAttributes {
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

  interface AccommodationPeakSeasonAttributes {
    id: number;
    start: string;
    end: string;
  }

  interface RoomsAttributes {
    id: number;
    label: string;
    normal_price: number;
    normal_weekend_price: number;
    peak_price: number;
    peak_weekend_price: number;
    standard_num: number;
    maximum_num: number;
    entrance: string;
    leaving: string;
    amenities: string;
    additional_info: string;
    seq: number;
  }

  interface EntireMenuAttributes {
    id: number;
    label: string;
    price: number;
    seq: number;
  }

  interface EntireMenuCategoryAttributes {
    id: number;
    category: string;
    seq: number;
  }

  interface ExposureMenuAttributes {
    id: number;
    label: string;
    price: number;
    comment: string;
    seq: number;
  }
  interface RestaurantAttributes {
    id: number;
    contact: string;
    site: string;
    kakao_chat: string;
    open: string;
    close: string;
    last_order: string;
    bname: string | null;
    building_name: string | null;
    detail_address: string | null;
    label: string;
    type: number;
    sido: string | null;
    sigungu: string | null;
    zonecode: string | null;
    road_address: string | null;
    introduction: string | null;
  }

  interface ImagesAttributes {
    id: number;
    file_name: string;
    category: number;
    seq: number;
  }


  interface ModelType {
    Users: Model<UsersAttributes>,
    Accommodation: Model<AccommodationAttributes>
    AccommodationPeakSeason: Model<AccommodationPeakSeasonAttributes>,
    AccommodationViewsCount: Model<AccommodationViewsCountAttributes>,
    Business: Model<BusinessAttributes>,
    EntireMenu: Model<EntireMenuAttributes>,
    EntireMenuCategory: Model<EntireMenuCategoryAttributes>,
    ExposureMenu: Model<ExposureMenuAttributes>,
    Images: Model<ImagesAttributes>,
    JoinCertification: Model<JoinCertificationAttributes>,
    Restaurant: Model<RestaurantAttributes>,
    RestaurantViewsCount: Model<RestaurantViewsCountAttributes>,
    Rooms: Model<RoomsAttributes>,
  }
}

