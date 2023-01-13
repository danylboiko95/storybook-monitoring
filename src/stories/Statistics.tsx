import { get } from "lodash";

const COMPONENTS_REPLACEMENT_MAPPER = {
  a: "Link",
  h1: "Header",
  div: "Box",
};

export const buildVersusData = (statistics: any, versusMapper: any) => {
  const getCount = (name: string) =>
    parseInt(
      get(
        statistics.find((statistic: any) => statistic.element === name),
        "count",
        "0"
      )
    );
  return Object.keys(versusMapper).map((key) => ({
    left: {
      name: versusMapper[key],
      count: getCount(versusMapper[key]),
      color: "steelblue",
    },
    right: {
      name: key,
      count: getCount(key),
      color: "tomato",
    },
  }));
};

const StatisticColumn = ({
  title,
  data,
}: {
  title: string;
  data: { name: string; color: string; count: number }[];
}) => (
  <div>
    <h1>{title}</h1>
    <ul style={{ listStyle: "none" }}>
      {data.map((item) => (
        <li key={item.name} style={{ color: item.color }}>
          {item.name}: {item.count}
        </li>
      ))}
    </ul>
  </div>
);

export const Statistics = (props: any) => {
  const mappedData = buildVersusData(props.data, COMPONENTS_REPLACEMENT_MAPPER);
  const getData = (prop: string) =>
    mappedData.map((item: any) => {
      return {
        name: item[prop].name,
        count: item[prop].count,
        color: item[prop].color,
      };
    });
  const left = getData("left");
  const right = getData("right");
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <StatisticColumn title="Custom Components" data={left} />
        <StatisticColumn title="HTML tags" data={right} />
      </div>
    </div>
  );
};
