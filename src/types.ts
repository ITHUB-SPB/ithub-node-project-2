export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Time = `${number}:${number}`;

export type NewsItem = {
    title: string;
    link: string;
    author: string;
    enclosure?: string | undefined;
    description: string;
    pubDate: string;
};

export type RubricItem = {
    title: string;
    id: string;
    parentId?: string | undefined;
    link: string;
};

export type RenderContext = {
    [key: string]: NewsItem[]
}

export type Rubrics = {
    rubrics: RubricItem[];
};

export type RubricsStorage = Rubrics & {
    lastModified: string;
};

export type Settings = {
    rubrics: RubricItem["id"][];
    schedule: {
        daysOfWeek: DayOfWeek[];
        time: Time[];
    };
}