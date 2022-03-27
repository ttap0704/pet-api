

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
