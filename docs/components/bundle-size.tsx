import size from "@/lib/generated/size.json";

const rows = [
  [<code key="code">import {"{ Lightbox }"}</code>, size.lightbox],
  [
    <code key="code">import {"{ MasonryGrid, JustifiedGrid, UniformGrid, GalleryFilter }"}</code>,
    size.grids,
  ],
  ["Everything the package exports", size.all],
  [<code key="code">styles.css</code>, size.css],
] as const;

/** Bundle size table, measured with size-limit when the docs are built. */
export function BundleSize() {
  return (
    <table>
      <thead>
        <tr>
          <th>Entry</th>
          <th>Size</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([entry, value], i) => (
          <tr key={i}>
            <td>{entry}</td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
