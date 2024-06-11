type EnumType = { [key: string]: never };

export abstract class EnumUtils {

	public static values<T extends EnumType>(enumType: T): Array<T[keyof T]> {
		return Object.keys(enumType)
			.filter(key => typeof key === "string" && isNaN(Number(key)))
			.map(key => enumType[key]);
	}

}