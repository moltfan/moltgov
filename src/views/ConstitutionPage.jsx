import React from 'react';
import { useConstitutionPresenter } from '../presenters/ConstitutionPresenter';
import './ConstitutionPage.css';

function ConstitutionPage() {
  const { constitutionData, loading, error } = useConstitutionPresenter();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-message">
          <span className="loading-spinner"></span>
          <span>Loading constitution...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  if (!constitutionData) {
    return (
      <div className="constitution-page">
        <div className="no-constitution-message">
          <h1>Constitution Not Found</h1>
          <p>No constitution information is available at this time.</p>
        </div>
      </div>
    );
  }

  const renderArticleContent = (content) => {
    if (!content || content.length === 0) return null;
    
    const elements = [];
    let currentList = [];
    let listType = null;
    
    content.forEach((item, index) => {
      if (item.type === 'list_item') {
        if (listType !== 'ordered') {
          // Close previous list if exists
          if (currentList.length > 0 && listType === 'unordered') {
            elements.push(
              <ul key={`list-${index}`} className="article-unordered-list">
                {currentList}
              </ul>
            );
            currentList = [];
          }
          listType = 'ordered';
        }
        currentList.push(
          <li key={index} className="article-list-item">
            {item.content}
          </li>
        );
      } else if (item.type === 'bullet_item') {
        if (listType !== 'unordered') {
          // Close previous list if exists
          if (currentList.length > 0 && listType === 'ordered') {
            elements.push(
              <ol key={`list-${index}`} className="article-ordered-list">
                {currentList}
              </ol>
            );
            currentList = [];
          }
          listType = 'unordered';
        }
        currentList.push(
          <li key={index} className="article-bullet-item">
            {item.content}
          </li>
        );
      } else {
        // Close any open list
        if (currentList.length > 0) {
          if (listType === 'ordered') {
            elements.push(
              <ol key={`list-${index}`} className="article-ordered-list">
                {currentList}
              </ol>
            );
          } else {
            elements.push(
              <ul key={`list-${index}`} className="article-unordered-list">
                {currentList}
              </ul>
            );
          }
          currentList = [];
          listType = null;
        }
        
        // Add current item
        if (item.type === 'note') {
          elements.push(
            <div key={index} className="article-note">
              {item.content}
            </div>
          );
        } else if (item.type === 'paragraph') {
          elements.push(
            <p key={index} className="article-paragraph">
              {item.content}
            </p>
          );
        }
      }
    });
    
    // Close any remaining list
    if (currentList.length > 0) {
      if (listType === 'ordered') {
        elements.push(
          <ol key="list-final" className="article-ordered-list">
            {currentList}
          </ol>
        );
      } else {
        elements.push(
          <ul key="list-final" className="article-unordered-list">
            {currentList}
          </ul>
        );
      }
    }
    
    return elements;
  };

  return (
    <div className="constitution-page">
      <div className="constitution-container">
        <div className="constitution-header">
          <h1>{constitutionData.title}</h1>
          <div className="constitution-version">
            Version {constitutionData.version} – Bootstrap Charter
          </div>
        </div>

        {constitutionData.preamble && (
          <div className="constitution-preamble">
            <h2>{constitutionData.preamble.title}</h2>
            <p>{constitutionData.preamble.content}</p>
          </div>
        )}

        {constitutionData.articles && constitutionData.articles.length > 0 && (
          <div className="constitution-articles">
            {constitutionData.articles.map((article) => (
              <div key={article.id} className="constitution-article">
                <div className="article-title">{article.article_title}</div>
                <div className="article-content">
                  {renderArticleContent(article.content)}
                </div>
              </div>
            ))}
          </div>
        )}

        {constitutionData.ratification && (
          <div className="constitution-ratification">
            {constitutionData.ratification}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConstitutionPage;
