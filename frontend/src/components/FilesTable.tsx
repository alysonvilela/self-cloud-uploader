import { useEffect, useMemo, useState } from "react";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

type FileRow = {
    id: string;
    originalName: string;
    s3Key: string;
    mimeType: string | null;
    size: number | null;
    userId: string;
    folderId: string | null;
    createdAt: string;
};

type PagedResponse = {
    data: FileRow[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};

function useQueryParamsState() {
    const [params, setParams] = useState(() => new URLSearchParams(window.location.search));
    useEffect(() => {
        const handler = () => setParams(new URLSearchParams(window.location.search));
        window.addEventListener("popstate", handler);
        return () => window.removeEventListener("popstate", handler);
    }, []);
    const update = (updater: (p: URLSearchParams) => void) => {
        const next = new URLSearchParams(params);
        updater(next);
        const url = new URL(window.location.href);
        url.search = next.toString();
        window.history.replaceState({}, "", url);
        setParams(next);
    };
    return [params, update] as const;
}

export function FilesTable() {
    const [qs, setQs] = useQueryParamsState();
    const page = Math.max(1, Number(qs.get("page") || 1));
    const pageSize = Math.max(20, Math.min(100, Number(qs.get("pageSize") || 20)));
    const q = qs.get("q") || "";
    const userId = qs.get("userId") || "";

    const [resp, setResp] = useState<PagedResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
        if (q) params.set("q", q);
        if (userId) params.set("userId", userId);
        fetch(`/api/files?${params.toString()}`)
            .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
            .then((json: PagedResponse) => {
                if (!cancelled) setResp(json);
            })
            .catch(err => !cancelled && setError(String(err?.message || err)))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [page, pageSize, q, userId]);

    const columns = useMemo<ColumnDef<FileRow>[]>(
        () => [
            { accessorKey: "id", header: "ID", cell: info => info.getValue() as string },
            { accessorKey: "originalName", header: "Nome do arquivo" },
            { accessorKey: "mimeType", header: "MIME" },
            { accessorKey: "size", header: "Tamanho", cell: info => formatSize(info.getValue() as number | null) },
            { accessorKey: "createdAt", header: "Criado em", cell: info => new Date(info.getValue() as string).toLocaleString() },
        ],
        []
    );

    const table = useReactTable({
        data: resp?.data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: resp?.totalPages ?? -1,
    });

    const total = resp?.total ?? 0;
    const totalPages = resp?.totalPages ?? 1;

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex flex-wrap items-end gap-3 mb-4">
                <div className="flex flex-col">
                    <label className="text-sm">Busca</label>
                    <input
                        className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700"
                        placeholder="nome contém..."
                        defaultValue={q}
                        onChange={e => setQs(p => {
                            if (e.target.value) p.set("q", e.target.value); else p.delete("q");
                            p.set("page", "1");
                        })}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm">Itens por página</label>
                    <select
                        className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700"
                        value={String(pageSize)}
                        onChange={e => setQs(p => p.set("pageSize", String(Math.max(20, Number(e.target.value))))) }
                    >
                        {[20, 50, 100].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1" />
                <div className="text-sm opacity-80">{loading ? "Carregando..." : `${total} itens`}</div>
            </div>

            <div className="overflow-x-auto border border-neutral-800 rounded">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-900">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-3 py-2 font-semibold">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td className="px-3 py-4" colSpan={columns.length}>Carregando...</td></tr>
                        ) : error ? (
                            <tr><td className="px-3 py-4 text-red-400" colSpan={columns.length}>{error}</td></tr>
                        ) : (resp?.data.length ?? 0) === 0 ? (
                            <tr><td className="px-3 py-4" colSpan={columns.length}>Nenhum arquivo encontrado</td></tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="odd:bg-neutral-950">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-3 py-2">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between mt-4">
                <button
                    className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700 disabled:opacity-50"
                    disabled={page <= 1}
                    onClick={() => setQs(p => p.set("page", String(Math.max(1, page - 1))))}
                >Anterior</button>
                <div className="text-sm">Página {page} de {totalPages}</div>
                <button
                    className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700 disabled:opacity-50"
                    disabled={page >= totalPages}
                    onClick={() => setQs(p => p.set("page", String(page + 1)))}
                >Próxima</button>
            </div>
        </div>
    );
}

function formatSize(size: number | null) {
    if (!size || size <= 0) return "-";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let s = size;
    let i = 0;
    while (s >= 1024 && i < units.length - 1) { s /= 1024; i++; }
    return `${s.toFixed(1)} ${units[i]}`;
}

