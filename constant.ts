export const RESTAURANT = 1;
export const ACCOMMODATION = 2;

export const EXPOSURE_MENU = 11;
export const ENTIRE_MENU = 12;
export const ROOMS = 21;

export const CONTENTS_CODE: {
  [prop: string]: any;
} = {
  restarunt: RESTAURANT,
  exposure_menu: EXPOSURE_MENU,
  entire_menu: ENTIRE_MENU,
  accommodation: ACCOMMODATION,
  rooms: ROOMS,
};

export const MODEL_STRING: {
  [props: string]: any;
} = {
  restaurant: 'Restaurant',
  exposure_menu: 'ExposureMenu',
  entire_menu: 'EntireMenu',
  accommodation: 'Accommodation',
  rooms: 'Rooms',
};

export const UPLOAD_PATH: {
  [prop: number]: any;
} = {
  [RESTAURANT]: '/restaurant/',
  [EXPOSURE_MENU]: '/exposure_menu/',
  [ACCOMMODATION]: '/accommodation/',
  [ROOMS]: '/rooms/',
};

export const CATEGORY_LIST: {
  [prop: number]: any;
} = {
  [RESTAURANT]: 'Restarunt',
  [EXPOSURE_MENU]: 'ExposureMenu',
  [ENTIRE_MENU]: 'EntireMenu',
  [ACCOMMODATION]: 'Accomodation',
  [ROOMS]: 'Rooms',
};

export const IMAGES_ID_LIST: {
  [prop: number]: any;
} = {
  [RESTAURANT]: 'restaurant_id',
  [EXPOSURE_MENU]: 'exposure_menu_id',
  [ACCOMMODATION]: 'accommodation_id',
  [ROOMS]: 'rooms_id',
};

export const ACCOMMODATION_BUSINESS_CODE_LIST = [
  '호텔업',
  '여관업',
  '휴양 콘도 운영업',
  '민박업',
  '기타 일반 및 생활 숙박시설 운영업',
  '숙박공유업',
  '그 외 기타 숙박업',
  '가족 호텔업',
  '호스텔업',
  '한국전통호텔업',
  '소형호텔업',
  '의료관광호텔업',
  '수상관광호텔업',
]

export const RESTAURANT_BUSINESS_CODE_LIST = [
  '한식 일반 음식점업',
  '중식 음식점업',
  '일식 음식점업',
  '서양식 음식점업',
  '출장 음식 음식점업',
  '치킨 전문점',
  '김밥 및 기타 간이 음식점업',
  '기관 구내식당업',
  '한식 면 요리 전문점',
  '한식 육류 요리 전문점',
  '한식 해산물 요리 전문점',
  '기타 외국식 음식점업',
  '피자, 햄버거, 샌드위치 및 유사 음식점업',
  '간이 음식 포장 판매 전문점',
  '일반 유흥 주점업',
  '무도 유흥 주점업',
  '생맥주 전문점',
  '기타 주점업',
  '제과점업',
  '커피 전문점',
  '간이 음식 포장 판매 전문점',
  '기타 비알코올 음료점업',
  '이동 음식점업',
]