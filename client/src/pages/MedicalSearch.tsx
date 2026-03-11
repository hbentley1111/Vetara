import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BackToDashboard } from "@/components/BackToDashboard";
import Navigation from "@/components/Navigation";
import {
  Search,
  BookOpen,
  ExternalLink,
  Stethoscope,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";

const quickSearchTopics = [
  { label: "Dog Vaccinations", query: "canine vaccination schedule recommendations" },
  { label: "Cat Dental Care", query: "feline dental disease prevention treatment" },
  { label: "Pet Nutrition", query: "companion animal nutrition dietary guidelines" },
  { label: "Flea & Tick Prevention", query: "flea tick prevention dogs cats veterinary" },
  { label: "Spay/Neuter Benefits", query: "spay neuter health benefits companion animals" },
  { label: "Puppy Health", query: "puppy health care first year veterinary" },
  { label: "Senior Pet Care", query: "geriatric veterinary medicine elderly pets" },
  { label: "Pet Allergies", query: "pet allergies dermatitis veterinary treatment" },
  { label: "Heartworm Prevention", query: "heartworm prevention treatment dogs cats" },
  { label: "Anxiety in Pets", query: "separation anxiety pets veterinary behavioral" },
];

export default function MedicalSearch() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  const { data: searchResults, isLoading: searchLoading, isFetching } = useQuery<any>({
    queryKey: ["/api/medical-search", activeQuery],
    queryFn: async () => {
      if (!activeQuery) return null;
      const res = await fetch(`/api/medical-search?q=${encodeURIComponent(activeQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: !!activeQuery,
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery.trim() + " veterinary");
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query.replace(" veterinary", ""));
    setActiveQuery(query);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Please log in to access medical search</h1>
        <Button onClick={() => window.location.href = "/api/login"}>Log In</Button>
      </div>
    );
  }

  const isSearching = searchLoading || isFetching;
  const articles = searchResults?.articles || [];
  const totalResults = searchResults?.totalResults || 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative">
        <Navigation />
        <div className="container mx-auto p-6 space-y-8">
          <BackToDashboard />

          <div className="flex items-center gap-3 mb-4">
            <Stethoscope className="h-8 w-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Veterinary Medical Search</h1>
              <p className="text-slate-400">
                Search peer-reviewed veterinary research from the National Library of Medicine
              </p>
            </div>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-200">
                <Search className="h-5 w-5 text-cyan-400" />
                Search Medical Literature
              </CardTitle>
              <CardDescription className="text-slate-400">
                Search PubMed's database of veterinary and animal health research articles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-3">
                <Input
                  placeholder="E.g., dog hip dysplasia treatment, feline kidney disease, parrot nutrition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                />
                <Button
                  type="submit"
                  disabled={!searchQuery.trim() || isSearching}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2">Search</span>
                </Button>
              </form>

              <div>
                <p className="text-xs text-slate-500 mb-2">Quick searches:</p>
                <div className="flex flex-wrap gap-2">
                  {quickSearchTopics.map((topic) => (
                    <Badge
                      key={topic.label}
                      className="cursor-pointer bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 transition-colors"
                      onClick={() => handleQuickSearch(topic.query)}
                    >
                      {topic.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {activeQuery && !isSearching && articles.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Showing {articles.length} of {totalResults.toLocaleString()} results for "{activeQuery.replace(' veterinary', '')}"
              </p>
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(activeQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                View all on PubMed <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {isSearching && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
              <p className="text-slate-400">Searching medical literature...</p>
            </div>
          )}

          {activeQuery && !isSearching && articles.length === 0 && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-slate-600 mb-4" />
                <p className="text-slate-300 text-lg font-medium">No results found</p>
                <p className="text-slate-500 text-sm mt-1">Try different keywords or a broader search term</p>
              </CardContent>
            </Card>
          )}

          {!isSearching && articles.length > 0 && (
            <div className="space-y-4">
              {articles.map((article: any) => (
                <Card key={article.uid} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-slate-600 transition-colors">
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <a
                            href={`https://pubmed.ncbi.nlm.nih.gov/${article.uid}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-medium text-cyan-300 hover:text-cyan-200 transition-colors leading-snug"
                          >
                            {article.title}
                          </a>
                        </div>
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${article.uid}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                        >
                          <Button variant="outline" size="sm" className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:text-white">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Read
                          </Button>
                        </a>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                        {article.authors && article.authors.length > 0 && (
                          <span>{article.authors.slice(0, 3).join(", ")}{article.authors.length > 3 ? " et al." : ""}</span>
                        )}
                        {article.source && (
                          <>
                            <span className="text-slate-600">|</span>
                            <span className="text-slate-300 font-medium">{article.source}</span>
                          </>
                        )}
                        {article.pubdate && (
                          <>
                            <span className="text-slate-600">|</span>
                            <span>{article.pubdate}</span>
                          </>
                        )}
                      </div>

                      {article.description && (
                        <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                          {article.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          PMID: {article.uid}
                        </Badge>
                        {article.pubtype && article.pubtype.length > 0 && article.pubtype.map((type: string, i: number) => (
                          <Badge key={i} className="bg-slate-700/50 text-slate-400 border-slate-600 text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!activeQuery && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-200">
                  <Info className="h-5 w-5 text-cyan-400" />
                  About This Resource
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-cyan-400" />
                      What You Can Find
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">&#8226;</span>
                        Peer-reviewed veterinary research articles
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">&#8226;</span>
                        Treatment guidelines and clinical studies
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">&#8226;</span>
                        Preventive care and nutrition information
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">&#8226;</span>
                        Disease diagnosis and management protocols
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">&#8226;</span>
                        Drug safety and pharmaceutical research
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                      Tips for Better Results
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">&#8226;</span>
                        Include the species name (e.g., "canine" or "feline")
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">&#8226;</span>
                        Use medical terms when possible (e.g., "dermatitis" instead of "skin rash")
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">&#8226;</span>
                        Combine condition + treatment (e.g., "feline diabetes insulin therapy")
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">&#8226;</span>
                        Try the quick search badges above for common topics
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">&#8226;</span>
                        Click "Read" to see the full article on PubMed
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Powered by the U.S. National Library of Medicine (NLM) PubMed database
                  </p>
                  <a
                    href="https://www.nlm.nih.gov/services/queries/veterinarymed.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    NLM Veterinary Resources <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}