import React from "react";
import { Link } from "react-router-dom";
export const NotFoundPage = () => (<div className="not-found-page min-h-screen flex flex-col items-center justify-center bg-background text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-xl rotate-45 animate-[slide-up_4s_ease-in-out_infinite_alternate] backdrop-blur-sm border border-primary/20"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-indigo-500/10 rounded-full animate-[slide-up_5s_ease-in-out_infinite_alternate_reverse] backdrop-blur-sm border border-indigo-500/20"></div>
            <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-blue-500/10 rounded-lg -rotate-12 animate-[slide-up_3s_ease-in-out_infinite_alternate] backdrop-blur-sm border border-blue-500/20"></div>
        </div>
        <div className="relative z-10 animate-fade-in-up bg-card/60 backdrop-blur-md border border-border/50 p-12 rounded-3xl shadow-2xl max-w-xl w-full mx-4">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-[slide-up_2s_ease-in-out_infinite_alternate] shadow-glow border border-primary/20">
                <div className="text-5xl">🪐</div>
            </div>
            <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500 mb-2 tracking-tight">
                404
            </h1>
            <h2 className="text-2xl font-bold text-foreground mb-4">
                Lost in space
            </h2>
            <p className="text-muted-foreground mb-8 text-base px-6">
                The page you&apos;re looking for has drifted into the void. 
                Let&apos;s get you back to familiar territory.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <Link to="/" className="btn btn-primary w-full sm:w-auto">
                    Return to Mission Control
                </Link>
                <Link to="/mall" className="btn btn-ghost w-full sm:w-auto">
                    Browse Directory
                </Link>
            </div>
            
            <div className="border-t border-border/50 pt-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Popular Destinations</p>
                <div className="flex flex-wrap gap-2 justify-center">
                    <Link to="/login" className="px-3 py-1.5 bg-secondary/80 hover:bg-secondary text-secondary-foreground text-sm font-medium rounded-lg transition-colors border border-border/50">Login</Link>
                    <Link to="/register" className="px-3 py-1.5 bg-secondary/80 hover:bg-secondary text-secondary-foreground text-sm font-medium rounded-lg transition-colors border border-border/50">Customer Sign Up</Link>
                </div>
            </div>
        </div>
	</div>);
