import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class TemplateManager {
    private _extensionUri: vscode.Uri;
    private _view?: vscode.WebviewView;

    constructor(extensionUri: vscode.Uri, view?: vscode.WebviewView) {
        this._extensionUri = extensionUri;
        this._view = view;
    }

    setView(view: vscode.WebviewView) {
        this._view = view;
    }

    /**
     * Load CSS content from file
     */
    private loadCSS(filename: string): string {
        try {
            // Try multiple paths - first from src (development), then from out (compiled)
            const paths = [
                path.join(this._extensionUri.fsPath, 'src', 'styles', filename),
                path.join(this._extensionUri.fsPath, 'out', 'styles', filename),
                path.join(this._extensionUri.fsPath, 'styles', filename)
            ];
            
            for (const cssPath of paths) {
                if (fs.existsSync(cssPath)) {
                    return fs.readFileSync(cssPath, 'utf8');
                }
            }
            
            console.error(`CSS file ${filename} not found in any of these paths:`, paths);
            return '';
        } catch (error) {
            console.error(`Failed to load CSS file ${filename}:`, error);
            return '';
        }
    }

    /**
     * Load HTML template from file
     */
    private loadTemplate(filename: string): string {
        try {
            // Try multiple paths - first from src (development), then from out (compiled)
            const paths = [
                path.join(this._extensionUri.fsPath, 'src', 'templates', filename),
                path.join(this._extensionUri.fsPath, 'out', 'templates', filename),
                path.join(this._extensionUri.fsPath, 'templates', filename)
            ];
            
            for (const templatePath of paths) {
                if (fs.existsSync(templatePath)) {
                    return fs.readFileSync(templatePath, 'utf8');
                }
            }
            
            console.error(`Template ${filename} not found in any of these paths:`, paths);
            return `<div>Template ${filename} not found. Paths checked: ${paths.join(', ')}</div>`;
        } catch (error) {
            console.error(`Failed to load template ${filename}:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            return `<div>Template loading error: ${errorMessage}</div>`;
        }
    }

    /**
     * Simple template engine - replaces {{variable}} with values
     */
    private renderTemplate(template: string, data: any = {}): string {
        let html = template;
        
        // Handle conditional sections {{#condition}}...{{/condition}}
        html = html.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, condition, content) => {
            return data[condition] ? content : '';
        });
        
        // Handle game CSS {{gameCSS:gameName}}
        html = html.replace(/\{\{gameCSS:([^}]+)\}\}/g, (match, gameName) => {
            const gameCSS = this.loadCSS(`${gameName}.css`);
            return gameCSS ? `<style>${gameCSS}</style>` : '';
        });
        
        // Replace simple variables {{variable}} (with optional whitespace)
        html = html.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, variable) => {
            return data[variable] !== undefined ? String(data[variable]) : match;
        });
        
        return html;
    }

    /**
     * Get theme CSS based on configuration
     */
    getThemeCSS(): string {
        const config = vscode.workspace.getConfiguration('ludus');
        const theme = config.get('theme', 'default') as string;
        
        if (theme === 'default') {
            return '';
        }
        
        const themeCSS = this.loadCSS('themes.css');
        return `<style>${themeCSS}</style>`;
    }

    /**
     * Get common CSS for all templates
     */
    getCommonCSS(): string {
        const commonCSS = this.loadCSS('common.css');
        return `<style>${commonCSS}</style>`;
    }

    /**
     * Replace resource URIs in the HTML
     */
    private replaceResourceUris(html: string): string {
        // Replace game script URIs
        html = html.replace(/\{\{gameScript:([^}]+)\}\}/g, (match, game) => {
            const scriptUri = this._view?.webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, 'out', 'games', `${game}.js`)
            );
            return scriptUri?.toString() || '';
        });

        // Replace logo URI
        html = html.replace(/\{\{logoUri\}\}/g, () => {
            const logoUri = this._view?.webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, 'ludus.png')
            );
            return logoUri?.toString() || '';
        });

        return html;
    }

    /**
     * Build complete HTML with theme and common styles
     */
    buildHTML(templateName: string, data: any = {}): string {
        const template = this.loadTemplate(templateName);
        const config = vscode.workspace.getConfiguration('ludus');
        const theme = config.get('theme', 'default') as string;
        
        // Prepare template data
        const templateData = {
            themeClass: theme !== 'default' ? `theme-${theme}` : '',
            themeCSS: this.getThemeCSS(),
            commonCSS: this.getCommonCSS(),
            ...data
        };
        
        // Render template with data
        let html = this.renderTemplate(template, templateData);
        
        // Replace resource URIs
        html = this.replaceResourceUris(html);
        
        return html;
    }

    /**
     * Get game HTML by game ID
     */
    getGameHTML(gameId: string, isNewWindow: boolean = false): string {
        const templateData = {
            gameId: gameId,
            showNewWindowBtn: !isNewWindow
        };

        return this.buildHTML(`${gameId}.html`, templateData);
    }

    /**
     * Get menu HTML with games data
     */
    getMenuHTML(gamesConfig: any[]): string {
        const templateData = {
            gamesConfig: JSON.stringify(gamesConfig),
            gamesCount: gamesConfig.length
        };

        return this.buildHTML('menu.html', templateData);
    }
}
