"use client";

import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { formatDistanceToNowStrict } from "date-fns";
import { Dot, Lock, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Repository {
  id: number;
  name: string;
  repoFullName: string;
  html_url: string;
  updated_at: string;
  private: boolean;
}

function GitHubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-4 w-4 mr-2"
      fill="currentColor"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.261.82-.577v-2.165c-3.338.727-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.09-.744.082-.729.082-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.833 2.809 1.304 3.494.996.107-.774.418-1.305.76-1.605-2.665-.305-5.466-1.333-5.466-5.933 0-1.312.468-2.381 1.236-3.221-.123-.303-.535-1.525.117-3.176 0 0 1.01-.323 3.3 1.23.958-.266 1.985-.399 3.005-.404 1.02.005 2.047.138 3.006.404 2.29-1.553 3.298-1.23 3.298-1.23.653 1.651.241 2.873.118 3.176.77.84 1.235 1.909 1.235 3.221 0 4.61-2.804 5.625-5.475 5.921.43.37.814 1.102.814 2.222v3.293c0 .318.218.694.824.576C20.565 21.798 24 17.303 24 12 24 5.373 18.627 0 12 0z" />
    </svg>
  );
}

export default function ConnectRepo() {
  const [searchTerm, setSearchTerm] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredRepositories = repositories.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    const fetchRepos = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/api/get-user-repos");
        setRepositories(response.data.repos);
      } catch (error) {
        console.error("Error fetching repositories:", error);
        setError("Failed to load repositories");
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  const handleConnect = async (repoFullName: string) => {
    try {
      const response = await axios.post("/api/create-web-hook", {
        repoFullName,
      });
      toast({
        title: "Connected Successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to connect",
      });
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <Card className="relative bg-background">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Import Git Repository
            </CardTitle>
            <CardDescription>Search for a repository to import</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Input
                type="text"
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow text-white border"
              />
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
            </div>
            {loading ? (
              <p>Loading repositories...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="rounded-md overflow-hidden">
                {filteredRepositories.map((repo, index) => (
                  <div
                    key={repo.id}
                    className={`flex items-center justify-between p-4 border border-gray-800 transition-all duration-200 ease-in-out hover:bg-gray-800 cursor-pointer ${
                      index === 0 ? "rounded-t-md" : ""
                    } ${
                      index === filteredRepositories.length - 1
                        ? "rounded-b-md"
                        : ""
                    }`}
                  >
                    <Link
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 flex-1"
                    >
                      <GitHubIcon />
                      <div className="flex items-center justify-center gap-2">
                        <h3 className="text-sm font-semibold ">{repo.name}</h3>
                        {repo.private && (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                        <p className="text-xs text-gray-400 flex items-center gap-0.2">
                          <Dot className="h-8 w-8 text-gray-400 " />
                          {formatDistanceToNowStrict(
                            new Date(repo.updated_at),
                            {
                              addSuffix: true,
                            }
                          )}
                        </p>
                      </div>
                    </Link>
                    <Button
                      className="text-white"
                      onClick={() => handleConnect(repo.repoFullName)}
                    >
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
