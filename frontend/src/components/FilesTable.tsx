import { useEffect, useMemo, useState } from "react";
import {
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

type FileRow = {
	id: number;
	publicId: string;
	originalName: string;
	s3Key: string;
	createdAt: string;
	userId: string;
	userName?: string | null;
};

type FilesResponse = {
	items: FileRow[];
	page: number;
	pageSize: number;
	total: number;
};

function useUrlSearchParam(key: string, initial: string): [string, (next: string) => void] {
	const [value, setValue] = useState<string>(() => new URLSearchParams(window.location.search).get(key) ?? initial);
	useEffect(() => {
		const url = new URL(window.location.href);
		if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
		history.replaceState(null, "", url);
	}, [key, value]);
	return [value, setValue];
}

function useUrlNumberParam(key: string, initial: number): [number, (next: number) => void] {
	const [str, setStr] = useUrlSearchParam(key, String(initial));
	return [Number(str || initial), (n: number) => setStr(String(n))];
}

export function FilesTable() {
	const [search, setSearch] = useUrlSearchParam("search", "");
	const [page, setPage] = useUrlNumberParam("page", 1);
	const [pageSize, setPageSize] = useUrlNumberParam("pageSize", 20);

	const [data, setData] = useState<FileRow[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let cancelled = false;
		async function run() {
			setLoading(true);
			try {
				const url = new URL("/api/files", window.location.origin);
				url.searchParams.set("page", String(page));
				url.searchParams.set("pageSize", String(pageSize));
				if (search) url.searchParams.set("search", search);
				const res = await fetch(url.toString());
				if (!res.ok) throw new Error("failed");
				const json: FilesResponse = await res.json();
				if (cancelled) return;
				setData(json.items);
				setTotal(json.total);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		run();
		return () => { cancelled = true; };
	}, [search, page, pageSize]);

	useEffect(() => {
		// If filters change, reset to first page
		setPage(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search, pageSize]);

	const columns = useMemo<ColumnDef<FileRow>[]>(() => [
		{ header: "ID Público", accessorKey: "publicId" },
		{ header: "Nome do Arquivo", accessorKey: "originalName" },
		{ header: "Usuário", accessorKey: "userName" },
		{ header: "Criado em", accessorKey: "createdAt" },
	], []);

	const table = useReactTable({
		data,
		columns,
		state: {},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2">
				<input
					type="text"
					placeholder="Buscar por nome..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="border rounded px-2 py-1 w-64"
				/>
				<select
					value={pageSize}
					onChange={(e) => setPageSize(Number(e.target.value))}
					className="border rounded px-2 py-1"
				>
					<option value={20}>20</option>
					<option value={50}>50</option>
					<option value={100}>100</option>
				</select>
			</div>

			<div className="overflow-auto border rounded">
				<table className="min-w-full text-left">
					<thead className="bg-gray-50">
						{table.getHeaderGroups().map(hg => (
							<tr key={hg.id}>
								{hg.headers.map(h => (
									<th key={h.id} className="px-3 py-2 text-sm font-semibold text-gray-700">
										{h.isPlaceholder ? null : h.column.columnDef.header as string}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{loading ? (
							<tr><td className="px-3 py-2" colSpan={columns.length}>Carregando...</td></tr>
						) : data.length === 0 ? (
							<tr><td className="px-3 py-2" colSpan={columns.length}>Nenhum arquivo</td></tr>
						) : (
							table.getRowModel().rows.map(r => (
								<tr key={r.id} className="border-t">
									{r.getVisibleCells().map(c => (
										<td key={c.id} className="px-3 py-2 text-sm">{c.getValue() as string}</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<div className="flex items-center gap-2">
				<button className="border rounded px-2 py-1" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
				<span>Página {page} de {totalPages}</span>
				<button className="border rounded px-2 py-1" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Próxima</button>
			</div>
		</div>
	);
}

