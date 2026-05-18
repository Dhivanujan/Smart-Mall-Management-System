import React, {
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

import { apiClient } from "@/services/api/client";
import { favoritesApi } from "@/services/api/favorites";
import { discoveryApi } from "@/services/api/discovery";

/* ---------------------------------- */
/* Reusable Components                */
/* ---------------------------------- */

const StarRating = ({ rating = 0 }) => {
	const full = Math.floor(rating);
	const empty = 5 - full;

	return (
		<div className="flex items-center gap-1 text-sm">
			<span className="text-yellow-400">
				{"★".repeat(full)}
			</span>

			<span className="text-slate-500">
				{"☆".repeat(empty)}
			</span>

			<span className="ml-1 text-slate-400 text-xs">
				{rating.toFixed(1)}
			</span>
		</div>
	);
};

const OccupancyBar = ({ percent = 0 }) => {
	const color =
		percent > 80
			? "bg-red-500"
			: percent > 50
				? "bg-yellow-500"
				: "bg-green-500";

	return (
		<div className="flex items-center gap-2 mt-1">
			<div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
				<div
					className={`h-full rounded-full transition-all duration-500 ${color}`}
					style={{
						width: `${Math.min(percent, 100)}%`,
					}}
				/>
			</div>

			<span className="text-xs font-semibold min-w-[36px] text-right text-slate-300">
				{percent.toFixed(0)}%
			</span>
		</div>
	);
};

const StatsCard = ({ title, value, color }) => {
	return (
		<div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 min-w-[140px] backdrop-blur-md">
			<div
				className="text-2xl font-bold"
				style={{ color }}
			>
				{value}
			</div>

			<div className="mt-1 text-xs uppercase tracking-wider text-slate-400 font-semibold">
				{title}
			</div>
		</div>
	);
};

const FilterPanel = ({
	searchInput,
	setSearchInput,
	category,
	setCategory,
	categories,
	statusFilter,
	setStatusFilter,
	sortBy,
	setSortBy,
	favoritesOnly,
	setFavoritesOnly,
}) => {
	return (
		<div className="rounded-3xl border border-slate-700 bg-slate-900/60 p-6 backdrop-blur-md">
			<div className="mb-5 border-b border-slate-700 pb-4">
				<h2 className="text-xl font-bold text-white">
					🔍 Filter Stores
				</h2>

				<p className="mt-1 text-sm text-slate-400">
					Find stores quickly using filters.
				</p>
			</div>

			<div className="space-y-4">
				<div>
					<label className="mb-1 block text-sm font-medium text-slate-300">
						Search
					</label>

					<input
						type="search"
						value={searchInput}
						onChange={(e) =>
							setSearchInput(e.target.value)
						}
						placeholder="Search store..."
						className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
					/>
				</div>

				<div>
					<label className="mb-1 block text-sm font-medium text-slate-300">
						Category
					</label>

					<select
						value={category}
						onChange={(e) =>
							setCategory(e.target.value)
						}
						className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
					>
						<option value="all">
							All Categories
						</option>

						{categories.map((cat) => (
							<option
								key={cat}
								value={cat}
							>
								{cat}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className="mb-1 block text-sm font-medium text-slate-300">
						Status
					</label>

					<select
						value={statusFilter}
						onChange={(e) =>
							setStatusFilter(e.target.value)
						}
						className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
					>
						<option value="all">
							All Statuses
						</option>

						<option value="open">
							Open
						</option>

						<option value="closed">
							Closed
						</option>
					</select>
				</div>

				<div>
					<label className="mb-1 block text-sm font-medium text-slate-300">
						Sort By
					</label>

					<select
						value={sortBy}
						onChange={(e) =>
							setSortBy(e.target.value)
						}
						className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
					>
						<option value="name">
							Name (A-Z)
						</option>

						<option value="rating">
							Rating
						</option>

						<option value="footfall">
							Footfall
						</option>

						<option value="occupancy">
							Occupancy
						</option>
					</select>
				</div>

				<label className="flex items-center gap-3 pt-2 text-sm text-slate-300">
					<input
						type="checkbox"
						checked={favoritesOnly}
						onChange={(e) =>
							setFavoritesOnly(
								e.target.checked
							)
						}
					/>

					Favorites Only
				</label>
			</div>
		</div>
	);
};

const TrendingStores = ({ stores }) => {
	if (!stores.length) return null;

	return (
		<div className="mb-6 rounded-3xl border border-slate-700 bg-slate-900/60 p-6 backdrop-blur-md">
			<h2 className="mb-4 text-xl font-bold text-white">
				🔥 Trending Right Now
			</h2>

			<div className="space-y-3">
				{stores.map((store) => (
					<div
						key={store.id}
						className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800/50 p-4"
					>
						<div>
							<div className="font-semibold text-white">
								{store.name}
							</div>

							<div className="text-sm text-slate-400">
								{store.category}
							</div>
						</div>

						<div className="text-sm font-semibold text-cyan-400">
							👥 {store.current_footfall}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

const StoreCard = ({
	store,
	isFavorite,
	onToggleFavorite,
	index,
}) => {
	return (
		<Link
			to={`/mall/stores/${store.id}`}
			className="group relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/60 p-5 transition hover:-translate-y-1 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10"
		>
			<div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 transition group-hover:opacity-100" />

			<div className="relative z-10">
				<div className="mb-4 flex items-start justify-between">
					<div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
						{store.category}
					</div>

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onToggleFavorite(
									store.id
								);
							}}
							className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-lg transition hover:border-red-400 hover:text-red-400"
						>
							{isFavorite ? "♥" : "♡"}
						</button>

						<div
							className={`rounded-full px-3 py-1 text-xs font-semibold ${
								store.status ===
								"open"
									? "bg-green-500/20 text-green-400"
									: "bg-red-500/20 text-red-400"
							}`}
						>
							{store.status}
						</div>
					</div>
				</div>

				<h3 className="mb-2 text-xl font-bold text-white">
					{store.name}
				</h3>

				<StarRating
					rating={store.average_rating}
				/>

				<div className="mt-5 flex gap-5">
					<div>
						<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Footfall
						</div>

						<div className="mt-1 text-lg font-bold text-cyan-400">
							{store.current_footfall}
						</div>
					</div>

					<div className="flex-1">
						<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Occupancy
						</div>

						<OccupancyBar
							percent={
								store.current_occupancy_percent
							}
						/>
					</div>
				</div>
			</div>
		</Link>
	);
};

/* ---------------------------------- */
/* Main Page                          */
/* ---------------------------------- */

export const MallOverviewPage = () => {
	const { user } = useAuth();
	const [stores, setStores] = useState([]);
	const [loading, setLoading] =
		useState(true);
	const [error, setError] = useState(null);

	const [searchInput, setSearchInput] =
		useState("");

	const [search, setSearch] =
		useState("");

	const [category, setCategory] =
		useState("all");

	const [statusFilter, setStatusFilter] =
		useState("all");

	const [sortBy, setSortBy] =
		useState("name");

	const [favoritesOnly, setFavoritesOnly] =
		useState(false);

	const [favoriteStoreIds, setFavoriteStoreIds] =
		useState([]);

	const [trendingStores, setTrendingStores] =
		useState([]);

	const [bannerMessage, setBannerMessage] =
		useState("");

	/* ------------------------------ */
	/* Debounced Search               */
	/* ------------------------------ */

	useEffect(() => {
		const timeout = setTimeout(() => {
			setSearch(searchInput);
		}, 300);

		return () => clearTimeout(timeout);
	}, [searchInput]);

	/* ------------------------------ */
	/* Auto Hide Banner               */
	/* ------------------------------ */

	useEffect(() => {
		if (!bannerMessage) return;

		const timer = setTimeout(() => {
			setBannerMessage("");
		}, 3000);

		return () => clearTimeout(timer);
	}, [bannerMessage]);

	/* ------------------------------ */
	/* Load Data                      */
	/* ------------------------------ */

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			try {
				setLoading(true);

				const [
					storesRes,
					trendingRes,
				] = await Promise.all([
					apiClient.get(
						"/api/v1/stores/"
					),
					discoveryApi.trendingStores(
						4
					),
				]);

				let favoritesData = [];
				if (user) {
					try {
						const favoritesRes = await favoritesApi.list();
						favoritesData = favoritesRes.data?.store_ids ?? [];
					} catch (e) {
						console.error("Failed to load favorites", e);
					}
				}

				if (cancelled) return;

				setStores(
					storesRes.data?.stores ?? []
				);

				setFavoriteStoreIds(favoritesData);

				setTrendingStores(
					trendingRes.data?.stores ??
						[]
				);

				setError(null);
			} catch (err) {
				console.error(err);

				if (cancelled) return;

				setError(
					"Failed to load mall overview."
				);
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		load();

		return () => {
			cancelled = true;
		};
	}, []);

	/* ------------------------------ */
	/* Derived State                  */
	/* ------------------------------ */

	const favoriteSet = useMemo(
		() => new Set(favoriteStoreIds),
		[favoriteStoreIds]
	);

	const categories = useMemo(() => {
		const set = new Set();

		stores.forEach((s) =>
			set.add(s.category)
		);

		return Array.from(set).sort();
	}, [stores]);

	const filteredStores = useMemo(() => {
		const result = stores.filter(
			(store) => {
				const matchesSearch =
					!search ||
					store.name
						.toLowerCase()
						.includes(
							search.toLowerCase()
						);

				const matchesCategory =
					category === "all" ||
					store.category === category;

				const matchesStatus =
					statusFilter === "all" ||
					store.status ===
						statusFilter;

				const matchesFavorites =
					!favoritesOnly ||
					favoriteSet.has(store.id);

				return (
					matchesSearch &&
					matchesCategory &&
					matchesStatus &&
					matchesFavorites
				);
			}
		);

		result.sort((a, b) => {
			switch (sortBy) {
				case "rating":
					return (
						b.average_rating -
						a.average_rating
					);

				case "footfall":
					return (
						b.current_footfall -
						a.current_footfall
					);

				case "occupancy":
					return (
						b.current_occupancy_percent -
						a.current_occupancy_percent
					);

				default:
					return a.name.localeCompare(
						b.name
					);
			}
		});

		return result;
	}, [
		stores,
		search,
		category,
		statusFilter,
		sortBy,
		favoritesOnly,
		favoriteSet,
	]);

	const totalFootfall = useMemo(
		() =>
			stores.reduce(
				(sum, s) =>
					sum +
					s.current_footfall,
				0
			),
		[stores]
	);

	const avgOccupancy = useMemo(() => {
		if (!stores.length) return 0;

		return (
			stores.reduce(
				(sum, s) =>
					sum +
					s.current_occupancy_percent,
				0
			) / stores.length
		);
	}, [stores]);

	const openStores = useMemo(
		() =>
			stores.filter(
				(s) => s.status === "open"
			).length,
		[stores]
	);

	/* ------------------------------ */
	/* Favorite Toggle                */
	/* ------------------------------ */

	const toggleFavorite = useCallback(
		async (storeId) => {
			try {
				if (
					favoriteSet.has(storeId)
				) {
					await favoritesApi.removeStore(
						storeId
					);

					setFavoriteStoreIds(
						(prev) =>
							prev.filter(
								(id) =>
									id !==
									storeId
							)
					);

					setBannerMessage(
						"Removed from favorites."
					);
				} else {
					await favoritesApi.addStore(
						storeId
					);

					setFavoriteStoreIds(
						(prev) => [
							...prev,
							storeId,
						]
					);

					setBannerMessage(
						"Added to favorites."
					);
				}
			} catch (err) {
				setBannerMessage(
					err.response?.data
						?.detail ||
						"Failed to update favorites."
				);
			}
		},
		[favoriteSet]
	);

	/* ------------------------------ */
	/* Loading                        */
	/* ------------------------------ */

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-950 p-8 text-white">
				<div className="mx-auto max-w-7xl animate-pulse">
					<div className="h-12 w-72 rounded-xl bg-slate-800" />

					<div className="mt-6 grid grid-cols-4 gap-4">
						{Array.from({
							length: 4,
						}).map((_, i) => (
							<div
								key={i}
								className="h-28 rounded-2xl bg-slate-800"
							/>
						))}
					</div>

					<div className="mt-8 grid grid-cols-3 gap-5">
						{Array.from({
							length: 6,
						}).map((_, i) => (
							<div
								key={i}
								className="h-64 rounded-3xl bg-slate-800"
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	/* ------------------------------ */
	/* Error                          */
	/* ------------------------------ */

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-950 p-8">
				<div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-300">
					<div className="text-5xl">
						⚠️
					</div>

					<h2 className="mt-4 text-2xl font-bold">
						{error}
					</h2>
				</div>
			</div>
		);
	}

	/* ------------------------------ */
	/* Render                         */
	/* ------------------------------ */

	return (
		<div className="min-h-screen bg-slate-950 text-white">
			<div className="mx-auto max-w-7xl px-6 py-10">
				<Link
					to="/"
					className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
				>
					← Back to Home
				</Link>

				<div className="mb-8">
					<div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
						● Discover stores and
						live activity
					</div>

					<h1 className="text-5xl font-black tracking-tight">
						Mall Directory &
						Live Snapshot
					</h1>

					<p className="mt-4 max-w-3xl text-lg text-slate-400">
						Browse all stores,
						check occupancy,
						monitor live
						footfall, and
						discover trending
						locations.
					</p>
				</div>

				<div className="mb-10 flex flex-wrap gap-4">
					<StatsCard
						title="Total Stores"
						value={stores.length}
						color="#818cf8"
					/>

					<StatsCard
						title="Open Now"
						value={openStores}
						color="#4ade80"
					/>

					<StatsCard
						title="Live Footfall"
						value={totalFootfall.toLocaleString()}
						color="#38bdf8"
					/>

					<StatsCard
						title="Avg Occupancy"
						value={`${avgOccupancy.toFixed(
							0
						)}%`}
						color="#facc15"
					/>
				</div>

				<div className="grid gap-8 lg:grid-cols-[320px_1fr]">
					<div>
						<FilterPanel
							searchInput={
								searchInput
							}
							setSearchInput={
								setSearchInput
							}
							category={
								category
							}
							setCategory={
								setCategory
							}
							categories={
								categories
							}
							statusFilter={
								statusFilter
							}
							setStatusFilter={
								setStatusFilter
							}
							sortBy={sortBy}
							setSortBy={
								setSortBy
							}
							favoritesOnly={
								favoritesOnly
							}
							setFavoritesOnly={
								setFavoritesOnly
							}
						/>
					</div>

					<div>
						{bannerMessage && (
							<div className="mb-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-5 py-4 text-indigo-300">
								{bannerMessage}
							</div>
						)}

						<TrendingStores
							stores={
								trendingStores
							}
						/>

						<div className="mb-5 flex items-center justify-between">
							<div className="text-sm text-slate-400">
								Showing{" "}
								{
									filteredStores.length
								}{" "}
								of{" "}
								{
									stores.length
								}{" "}
								stores
							</div>
						</div>

						{filteredStores.length ===
						0 ? (
							<div className="rounded-3xl border border-slate-700 bg-slate-900/60 p-12 text-center">
								<div className="text-6xl">
									🔍
								</div>

								<h3 className="mt-5 text-2xl font-bold">
									No Stores
									Found
								</h3>

								<p className="mt-2 text-slate-400">
									Try
									changing
									search
									or filter
									options.
								</p>
							</div>
						) : (
							<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
								{filteredStores.map(
									(
										store,
										index
									) => (
										<StoreCard
											key={
												store.id
											}
											store={
												store
											}
											index={
												index
											}
											isFavorite={favoriteSet.has(
												store.id
											)}
											onToggleFavorite={
												toggleFavorite
											}
										/>
									)
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};