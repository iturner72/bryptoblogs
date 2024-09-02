import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'

import BlogPost from '../components/BlogPost';
import Pagination from '../components/Pagination';
import Filter from '../components/Filter';
import Search from '../components/Search';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const POSTS_PER_PAGE = 12;

function getSessionPage() {
  if (typeof window !== 'undefined') {
    const cachedPage = sessionStorage.getItem("currentPage");
    return cachedPage ? parseInt(cachedPage) : 0;
  } else {
    return 0;
  }
}

export default function Home() {
  const [blogPostsList, setBlogPostsList] = useState([]);
  const [page, setPage] = useState(getSessionPage());
  const [totalPages, setTotalPages] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [filters, setFilters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (filterValue) => {
    setFilters(filterValue);
    setPage(0); // Reset page when filter changes to display results from the first page
  };

  const handleSearch = (searchString) => {
    setSearchTerm(searchString);
    setPage(0);
  };

  // Fetching
  const fetchPosts = async (pageNumber) => {
    // Check if poasts are already stored in cache
    const cachedPosts = sessionStorage.getItem(`poasts-${pageNumber}`);
    const cachedTotalPages = sessionStorage.getItem("totalPages");

    if (cachedPosts && cachedTotalPages && filters.length === 0 && searchTerm.length === 0) {
      setBlogPostsList(JSON.parse(cachedPosts));
      setTotalPages(parseInt(cachedTotalPages));
      setDataLoaded(true);
    } else {
      // Query 'poasts' table with a join on 'links' table to get the logo_url
      let query = supabase
        .from('poasts')
        .select("*, links!posts_company_fkey(logo_url)", { count: "exact" })
        .order('published_at', { ascending: false })
        .order('id', { ascending: false });

      // Filter results
      if (filters.length > 0) {
        query = query.in('company', filters);
      }

      //Search
      if (searchTerm.length > 0) {
        query = query.or(`title.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%, summary.ilike.%${searchTerm}%, company.ilike.%${searchTerm}%`);
      }

      let { count, data: poasts, error } = await query.range(pageNumber * POSTS_PER_PAGE, (pageNumber + 1) * POSTS_PER_PAGE - 1);

      if (error) {
        console.error("Error fetching poasts:", error);
      } else {
        setBlogPostsList(poasts);

        const totalPages = Math.ceil(count / POSTS_PER_PAGE);
        setTotalPages(totalPages);
        setDataLoaded(true);

        // Store poasts and totalPages in cache
        if (filters.length === 0 && searchTerm.length === 0) {
          sessionStorage.setItem(`poasts-${pageNumber}`, JSON.stringify(poasts));
          sessionStorage.setItem("totalPages", totalPages);
        }
      }
    }
  };

  useEffect(() => {
    fetchPosts(page);
    sessionStorage.setItem("currentPage", page);
  }, [page, filters, searchTerm]);

  // Prefetching
  const prefetchPosts = async (pageNumber, filters) => {
    const cachedPosts = sessionStorage.getItem(`poasts-${pageNumber}`);

    // If we have the data in the cache, no need to prefetch
    if (cachedPosts) return;

    let query = supabase
      .from('poasts')
      .select("*, links(logo_url)", { count: "exact" })
      .order('published_at', { ascending: false })
      .order('id', { ascending: false });

    // Filter results
    if (filters.length > 0) {
      query = query.in('company', filters);
    }
    // Search 
    if (searchTerm.length > 0) {
      query = query.or(`description.ilike.%${searchTerm}%, title.ilike.%${searchTerm}%`);
    }

    let { count, data: poasts, error } = await query.range(pageNumber * POSTS_PER_PAGE, (pageNumber + 1) * POSTS_PER_PAGE - 1);

    if (error) {
      console.error("Error fetching poasts:", error);
    } else {
      // Store poasts in cache
      sessionStorage.setItem(`poasts-${pageNumber}`, JSON.stringify(poasts));
    }
  };

  useEffect(() => {
    const nextPage = page + 1;
    if (nextPage < totalPages) {
      prefetchPosts(nextPage, filters);
    }

    const prevPage = page - 1;
    if (prevPage >= 0) {
      prefetchPosts(prevPage, filters);
    }
  }, [page, totalPages, filters, searchTerm]);

  return (
    <div className="font-berkeley m-8 md:m-10 pb-20">
      {/* Header */}
      <div className="flex text-center flex-col mb-4">
        <div className="font-bold text-4xl mb-2">bryptoblogs</div>
        <div className="text-md">learn from your favorite [brypto] companies <br /> (shamelessly yoinked from <a href="https://github.com/ishan0102/engblogs" className="text-emerald-500 hover:text-emerald-700 underline">ishan</a>(10x engineer))</div>
      </div>
      <div className="absolute top-0 right-0 md:top-4 md:right-4">
        <a href="https://github.com/iturner72/bryptoblogs" target="_blank" rel="noopener noreferrer">
          <button className="max-w-md mx-auto bg-white rounded-lg text-sm border border-white hover:border-black transition p-2">
            github
          </button>
        </a>
      </div>

      {/* Web Navigation - Shown on medium screens and up */}
      <div className="hidden md:grid grid-cols-3 gap-4 items-center">
        <div className="justify-self-start">
          <Filter onFilterChange={handleFilterChange} supabase={supabase} />
        </div>
        <div className="justify-self-center">
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
        <div className="justify-self-end">
          <Search onSearch={handleSearch} />
        </div>
      </div>

      {/* Mobile Navigation - Shown on small screens */}
      <div className="md:hidden">
        <Filter onFilterChange={handleFilterChange} supabase={supabase} />
        <Search onSearch={handleSearch} />
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {blogPostsList.map((post, index) => (
          <BlogPost
            key={post.id}
            title={post.title}
            published_at={post.published_at}
            link={post.link}
            description={post.description}
            summary={post.summary}
            company={post.company}
            logoUrl={post.links.logo_url}
          />
        ))}
      </div>

      {/* Bottom Pagination */}
      {dataLoaded && <Pagination page={page} totalPages={totalPages} setPage={setPage} />}

      {/* Loading */}
      {!dataLoaded && (
        <div className="flex justify-center mt-8">
          <svg className="animate-spin h-8 w-8 text-emerald-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
      )
      }

      {/* Footer */}
      {dataLoaded &&
        <div className="text-center mt-8">
          built by <a className="text-emerald-500 hover:text-emerald-700" href="https://www.ishanshah.me/" target="_blank">ishan</a>. modified by <a className="text-emerald-500 hover:text-emerald-700" href="https://www.iturner.xyz/" target="_blank">ian</a>.
          summaries by <a className="text-emerald-500 hover:text-emerald-700" href="https://platform.openai.com/docs/models/gpt-3-5" target="_blank">gpt-3.5</a>.
        </div>
      }
    </div>
  )
}
